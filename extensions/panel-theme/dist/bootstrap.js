import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
// EverShop payment registration (loaded at runtime, not TS-typed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let registerPaymentMethod;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let addConfigProcessor;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function panelThemeBootstrap(app) {
    // Guard: during build phase the context is not an Express app
    if (!app || typeof app.use !== 'function') return;
    // Security headers (F4.8)
    app.use(helmet({
        contentSecurityPolicy: false
    }));
    // Rate limiting on admin login — 20 req / 15 min (F4.4)
    const adminLoginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: 'Too many login attempts, please try again later.'
        }
    });
    app.use('/admin/user/login', adminLoginLimiter);
    // Register MercadoPago as payment method
    try {
        const checkoutServices = await import('@evershop/evershop/dist/modules/checkout/services/getAvailablePaymentMethods.js');
        registerPaymentMethod = checkoutServices.registerPaymentMethod;
    } catch  {
        // Module not loaded yet during build
        return;
    }
    registerPaymentMethod({
        init: async ()=>({
                code: 'mercadopago',
                name: 'MercadoPago'
            }),
        validator: async ()=>{
            // Only enabled if MP_ACCESS_TOKEN is set
            return !!process.env.MP_ACCESS_TOKEN;
        }
    });
    // Register MercadoPago payment status codes
    try {
        const { addConfigProcessor } = await import('@evershop/evershop/dist/lib/util/registry.js');
        addConfigProcessor('orderPaymentStatus', (statuses)=>({
                ...statuses,
                mp_paid: {
                    name: 'Pagado (MP)',
                    badge: 'success',
                    isCancelable: false,
                    isDefault: false
                },
                mp_pending: {
                    name: 'Pendiente (MP)',
                    badge: 'warning',
                    isCancelable: true,
                    isDefault: false
                },
                mp_rejected: {
                    name: 'Rechazado (MP)',
                    badge: 'critical',
                    isCancelable: true,
                    isDefault: false
                },
                mp_cancelled: {
                    name: 'Cancelado (MP)',
                    badge: 'destructive',
                    isCancelable: false,
                    isDefault: false
                }
            }), 10);
    } catch  {
    // Registry not available during build
    }
}
