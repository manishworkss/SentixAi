/// <reference path="../types/express.d.ts" />
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../utils/db';
import { updateRoleSchema, updateStatusSchema } from '../schemas/user.schema';

const router = Router();

// Step 8: Current User Endpoint
router.get('/me', requireAuth, (req, res) => {
  if (!req.dbUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.json({
    success: true,
    data: {
      id: req.dbUser.id,
      email: req.dbUser.email,
      phone: req.dbUser.phone,
      gender: req.dbUser.gender,
      name: req.dbUser.name,
      role: req.dbUser.role,
      status: req.dbUser.status,
    }
  });
});

// Update Current User
router.patch('/me', requireAuth, async (req, res) => {
  if (!req.dbUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { name, gender, phone, email } = req.body;
    
    // We only update fields that are provided
    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (email !== undefined) dataToUpdate.email = email;

    const updatedUser = await db.user.update({
      where: { id: req.dbUser.id },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        name: updatedUser.name,
        role: updatedUser.role,
        status: updatedUser.status,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Email or phone already in use by another account.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Step 9: Admin User Management

router.patch('/:id/role', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const id = req.params.id as string;
    const validatedData = updateRoleSchema.parse(req.body);

    const updatedUser = await db.user.update({
      where: { id },
      data: { role: validatedData.role }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: updatedUser.id,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid role', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

router.patch('/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const id = req.params.id as string;
    const validatedData = updateStatusSchema.parse(req.body);

    const updatedUser = await db.user.update({
      where: { id },
      data: { status: validatedData.status }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: updatedUser.id,
        status: updatedUser.status
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid status', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

export default router;
