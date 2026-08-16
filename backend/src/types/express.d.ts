import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
      dbUser?: any; // Will be typed when Prisma model is integrated
    }
  }
}
