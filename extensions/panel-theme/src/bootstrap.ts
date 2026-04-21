import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function panelThemeBootstrap(app: any) {
  // Register MercadoPago payment method — must run regardless of app context
  try {
    const { registerPaymentMethod } = await import('@evershop/evershop/checkout/services');
    registerPaymentMethod({
      init: async () => ({
        code: 'mercadopago',
        name: 'MercadoPago'
      }),
      validator: async () => {
        try {
          const cfg = (await import('config')).default;
          return !!(cfg.has('mercadopago.accessToken') && cfg.get('mercadopago.accessToken'));
        } catch {
          return !!process.env.MP_ACCESS_TOKEN;
        }
      }
    });
  } catch {
    // Checkout services not available
  }

  // Register MercadoPago payment status codes
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { addProcessor } = await import('@evershop/evershop/lib/util/registry' as any);
    addProcessor('orderPaymentStatus', (statuses: Record<string, object>) => ({
      ...statuses,
      mp_paid: { name: 'Pagado (MP)', badge: 'success', isCancelable: false, isDefault: false },
      mp_pending: { name: 'Pendiente (MP)', badge: 'warning', isCancelable: true, isDefault: false },
      mp_rejected: { name: 'Rechazado (MP)', badge: 'critical', isCancelable: true, isDefault: false },
      mp_cancelled: { name: 'Cancelado (MP)', badge: 'destructive', isCancelable: false, isDefault: false }
    }), 10);
  } catch {
    // Registry not available during build
  }

  // Express middleware — only apply when running as HTTP server
  if (!app || typeof app.use !== 'function') return;

  app.use(helmet({ contentSecurityPolicy: false }));

  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
  });
  app.use('/admin/user/login', adminLoginLimiter);
}
