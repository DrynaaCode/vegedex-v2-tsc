import { JwtPayload } from '../middlewares/auth.middleware'; // adapte le chemin si besoin

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
