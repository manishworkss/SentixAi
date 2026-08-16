import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { logger } from '../utils/logger';

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
    
    // Attach the decoded token to the request object
    req.user = decodedToken;
    
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
