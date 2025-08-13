import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: JwtPayload & {
    id: string;
    email: string;
    role: string;
  };
}
