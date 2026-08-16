import { Router } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { db } from '../utils/db';

const router = Router();

// ─── Gmail SMTP Config ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bcawithmanish0008@gmail.com', // TODO: Move to env vars
    pass: 'ysnm ounx gckp cjaz'
  }
});

// ─── Secure OTP Helpers ───────────────────────────────────────────────
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// ─── POST /api/send-otp ──────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Basic rate limit: block if an OTP was requested less than 1 minute ago
    const existingOtp = await db.otpVerification.findUnique({ where: { email } });
    if (existingOtp && existingOtp.createdAt > new Date(Date.now() - 60 * 1000)) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting another OTP.' });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the OTP securely in the database
    await db.otpVerification.upsert({
      where: { email },
      update: { otpHash, expiresAt, attempts: 0, createdAt: new Date() },
      create: { email, otpHash, expiresAt }
    });

    await transporter.sendMail({
      from: '"SentixAI Platform" <bcawithmanish0008@gmail.com>',
      to: email,
      subject: `${otp} is your SentixAI verification code`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; color: #1a1a2e; margin: 0;">Sentix<span style="color: #00B4D8; font-weight: 300;">[Ai]</span></h1>
            <p style="color: #888; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">AI-Powered Movie Reviews & Recommendations</p>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; margin-top: 0;">Hi ${name || 'there'},</p>
            <p style="color: #374151; font-size: 14px;">Use the verification code below to complete your SentixAI signup:</p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background: #1c1333; color: white; font-size: 32px; font-weight: bold; letter-spacing: 10px; padding: 16px 32px; border-radius: 12px;">
                ${otp}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 13px; text-align: center;">This code expires in <b>5 minutes</b>.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });

    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('❌ Email send failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// ─── POST /api/verify-otp ────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const stored = await db.otpVerification.findUnique({ where: { email } });

    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (stored.attempts >= 3) {
      await db.otpVerification.delete({ where: { email } });
      return res.status(403).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (new Date() > stored.expiresAt) {
      await db.otpVerification.delete({ where: { email } });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const otpHash = hashOTP(otp);
    if (stored.otpHash !== otpHash) {
      await db.otpVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } }
      });
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP is valid — remove it so it can't be reused
    await db.otpVerification.delete({ where: { email } });
    console.log(`✅ OTP verified for ${email}`);
    res.json({ success: true, message: 'OTP verified successfully' });

  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});



export default router;
