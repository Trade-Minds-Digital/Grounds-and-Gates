import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { User } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { _id?: string };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      errorResponse(res, 'Authentication required. No token provided.', 401);
      return;
    }

    const decoded = verifyAccessToken(token);

    // Verify user still exists, is active, and session has not been revoked
    const user = await User.findById(decoded.userId).select('accountStatus tokenVersion');
    if (!user || user.accountStatus !== 'active') {
      errorResponse(res, 'Account is inactive, suspended, or not found.', 403);
      return;
    }

    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
      errorResponse(res, 'Session has been revoked. Please sign in again.', 401, { code: 'SESSION_REVOKED' });
      return;
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      errorResponse(res, 'Access token expired.', 401, { code: 'TOKEN_EXPIRED' });
      return;
    }
    errorResponse(res, 'Invalid authentication token.', 401);
  }
};

// Optional authentication for public routes that adapt when a user is signed in
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {}
  next();
};
