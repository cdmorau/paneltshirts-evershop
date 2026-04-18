import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function panelThemeBootstrap(app: any) {
  // Guard: during build phase the context is not an Express app
  if (!app || typeof app.use !== 'function') return;

  // Security headers (F4.8)
  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );

  // Rate limiting on admin login — 20 req / 15 min (F4.4)
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
  });
  app.use('/admin/user/login', adminLoginLimiter);
}
