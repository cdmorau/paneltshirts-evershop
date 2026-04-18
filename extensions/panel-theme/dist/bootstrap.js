import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

export default async function panelThemeBootstrap(app) {
  // Security headers (F4.8)
  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );

  // Rate limiting on admin login — 20 requests per 15 minutes (F4.4)
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
  });
  app.use('/admin/user/login', adminLoginLimiter);
}
