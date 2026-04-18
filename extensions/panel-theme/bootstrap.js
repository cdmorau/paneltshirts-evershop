import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { addProcessor } from '@evershop/evershop/lib/util/registry.js';

export default async function panelThemeBootstrap(app) {
  // Security headers
  app.use(
    helmet({
      // CSP configured separately to allow CDN images and inline styles for EverShop
      contentSecurityPolicy: false
    })
  );

  // Rate limiting on admin login endpoint
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
  });
  app.use('/admin/user/login', adminLoginLimiter);

  // Theme config defaults
  addProcessor(
    'configurationSchema',
    (schema) => {
      schema.properties.system.properties.theme = { type: 'string' };
      return schema;
    },
    1
  );
}
