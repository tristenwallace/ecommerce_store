import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type with your custom properties
interface Request extends ExpressRequest {
  user?: {
    id: number;
    username: string;
    is_admin: boolean;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });

    // Ensure the payload includes the expected fields
    if (
      typeof payload === 'object' &&
      'id' in payload &&
      'username' in payload &&
      'is_admin' in payload
    ) {
      // Attach the decoded payload to the request. You need to cast the payload to your JwtPayload type.
      req.user = {
        id: payload.id,
        username: payload.username,
        is_admin: payload.is_admin,
      };
      next();
    } else {
      return res.status(403).json({ error: 'Invalid token payload' });
    }
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Access restricted to admins' });
  }
  next();
};

export const isAdminOrCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const userId = parseInt(id, 10);

  if (!req.user || (req.user.id !== userId && !req.user.is_admin)) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  next();
};
