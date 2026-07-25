import { AuthUser } from '../modules/auth/types/auth.service.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
