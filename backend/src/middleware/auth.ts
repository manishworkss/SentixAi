import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { logger } from '../utils/logger';
import { db } from '../utils/db';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or malformed Authorization header',
      error: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Step 4: User Synchronization
    // Look up or create the user in our MySQL database based on firebaseUid
    let dbUser = await db.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || null,
        }
      });
      logger.info({ userId: dbUser.id }, 'New user synchronized from Firebase');
    }

    // Step 6: User Status check
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
    logger.warn({ error: error.message }, 'Firebase token verification failed');
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
      error: 'INVALID_TOKEN'
    });
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
