import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // MOCK: Firebase is removed for now, we just pass a mock user or find the first user
    let dbUser = await db.user.findFirst();
    
    // If no user exists, create a dummy one for testing
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          firebaseUid: 'mock-uid-' + Date.now(),
          email: 'mock@example.com',
          name: 'Mock User',
        }
      });
      logger.info({ userId: dbUser.id }, 'Created mock user for development');
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
    logger.warn({ error: error.message }, 'Mock auth failed');
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during mock auth',
      error: 'AUTH_ERROR'
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
