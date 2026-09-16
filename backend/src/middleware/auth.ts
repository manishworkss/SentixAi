/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp(); // Will look for GOOGLE_APPLICATION_CREDENTIALS
  } catch (err) {
    logger.warn('Firebase Admin initialization failed. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.');
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing or invalid token',
        error: 'UNAUTHORIZED'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (e: any) {
      // If Firebase Admin isn't configured with a service account, fallback to basic decoding for local dev testing
      if (e.message.includes('credential') || e.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
        logger.warn('Firebase Admin is missing credentials. Using insecure local fallback to decode JWT.');
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        decodedToken = {
          uid: payload.user_id || payload.sub,
          email: payload.email || '',
          name: payload.name || payload.email?.split('@')[0] || 'Local User',
        };
      } else {
        throw e;
      }
    }
    
    const { uid, email, name } = decodedToken;

    // Find or create the user in local DB
    let dbUser = await db.user.findUnique({ where: { firebaseUid: uid } });
    
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          firebaseUid: uid,
          email: email || null,
          name: name || null,
        }
      });
      logger.info({ userId: dbUser.id }, 'Created local user for authenticated Firebase user');
    }

    if (dbUser.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Account is inactive',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Attach the application user object to the request
    req.dbUser = dbUser;
    
    next();
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Firebase auth failed');
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
      error: 'AUTH_ERROR'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    const { uid, email, name } = decodedToken;

    let dbUser = await db.user.findUnique({ where: { firebaseUid: uid } });
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          firebaseUid: uid,
          email: email || null,
          name: name || null,
        }
      });
      logger.info({ userId: dbUser.id }, 'Created local user for authenticated Firebase user (optionalAuth)');
    }

    if (dbUser.status !== 'INACTIVE') {
      req.dbUser = dbUser;
    }
    next();
  } catch (error: any) {
    next(); // Ignore errors and proceed as unauthenticated
  }
};

// Step 7: Authorization Middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not loaded',
        error: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.dbUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};
