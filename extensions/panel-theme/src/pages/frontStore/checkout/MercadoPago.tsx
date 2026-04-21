import { useCheckout, useCheckoutDispatch } from '@components/frontStore/checkout/CheckoutContext.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MercadoPagoProps {
  getMPConfigApi: string;
  processMPPaymentApi: string;
  createMPPreferenceApi: string;
  cart?: { grandTotal?: { value?: number } };
}

function loadMPScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>)['MercadoPago']) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de MercadoPago'));
    document.head.appendChild(script);
  });
}

function waitForContainer(id: string, maxAttempts = 120): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const el = document.getElementById(id);
      if (el) { resolve(el); return; }
      if (attempts++ >= maxAttempts) {
        reject(new Error(`Contenedor #${id} no encontrado en el DOM`));
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

// Colombia minimum — real amount is always from order.grand_total on backend
const MIN_MP_AMOUNT_COP = 1000;

export default function MercadoPagoMethod({ getMPConfigApi, processMPPaymentApi, createMPPreferenceApi, cart }: MercadoPagoProps) {
  const { registerPaymentComponent, checkout } = useCheckoutDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { checkoutData } = useCheckout() as any;

  const isMPSelected = checkoutData?.paymentMethod === 'mercadopago';
  const rawCartTotal = Number(cart?.grandTotal?.value ?? 0);
  const brickAmount = rawCartTotal > 0 ? rawCartTotal : MIN_MP_AMOUNT_COP;

  // brickError is the ONLY state that FormRenderer depends on.
  // Any other state change (loading, etc.) would recreate FormRenderer → destroy
  // #mp-brick-container → orphan the mounted Brick.
  const [brickError, setBrickError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brickRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderRef = useRef<any>(null);  // Cached order to survive cart consumption on retry

  // Stable FormRenderer — only recreated when there is a fatal error.
  // minHeight reserves space while the Brick's own spinner loads.
  const FormRenderer = useCallback(() => (
    <div style={{ paddingTop: '8px', minHeight: '300px' }}>
      {brickError && (
        <div style={{
          padding: '10px 14px',
          background: '#fff0f0',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          fontSize: '0.85rem',
          marginBottom: '12px'
        }}>
          {brickError}
        </div>
      )}
      <div id="mp-brick-container" />
    </div>
  ), [brickError]);

  useEffect(() => {
    registerPaymentComponent('mercadopago', {
      nameRenderer: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#009EE3" />
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
              fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="white">MP</text>
          </svg>
          <span style={{ fontWeight: 600, color: '#009EE3' }}>MercadoPago</span>
        </div>
      ),
      formRenderer: FormRenderer,
      // Suppress EverShop's default Place Order button — the Brick has its own
      checkoutButtonRenderer: () => <></>
    });
  }, [FormRenderer]);

  useEffect(() => {
    if (!isMPSelected) {
      brickRef.current?.unmount?.();
      brickRef.current = null;
      orderRef.current = null;
      setBrickError(null);
      return;
    }

    let cancelled = false;

    const initBrick = async () => {
      setBrickError(null);

      // 1. Get public key
      let publicKey: string;
      try {
        const cfg = await fetch(getMPConfigApi).then(r => r.json());
        if (cfg.error) throw new Error(cfg.error.message ?? 'MP no configurado');
        publicKey = cfg.data.public_key;
      } catch (e) {
        if (!cancelled) setBrickError((e as Error).message);
        return;
      }

      // 2. Load MP SDK
      try {
        await loadMPScript();
      } catch {
        if (!cancelled) setBrickError('No se pudo cargar MercadoPago. Verifica tu conexión y recarga.');
        return;
      }

      if (cancelled) return;

      // 3. Wait for the container rendered by FormRenderer
      try {
        await waitForContainer('mp-brick-container');
      } catch (e) {
        if (!cancelled) setBrickError((e as Error).message);
        return;
      }

      if (cancelled) return;

      // 4. Create Payment Brick following MP Colombia docs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = new (window as any).MercadoPago(publicKey, { locale: 'es-CO' });
      const bricks = mp.bricks();

      try {
        brickRef.current = await bricks.create('payment', 'mp-brick-container', {
          initialization: { amount: brickAmount },
          customization: {
            visual: { style: { theme: 'default' } },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              ticket: 'all',       // Efecty
              bankTransfer: 'all'  // PSE
            }
          },
          callbacks: {
            onReady: () => {},  // No state update — avoids FormRenderer recreation
            onSubmit: ({ selectedPaymentMethod, formData }: { selectedPaymentMethod: string; formData: object }) => {
              return new Promise<void>((resolve, reject) => {
                void (async () => {
                  try {
                    // Reuse cached order on retry — cart is consumed after first checkout()
                    if (!orderRef.current) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      orderRef.current = await (checkout as any)();
                    }
                    const order = orderRef.current;
                    if (!order?.uuid) { orderRef.current = null; reject(); return; }

                    // Step 1: Try direct payment processing (production with full seller setup)
                    const paymentResult = await fetch(processMPPaymentApi, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ formData, order_id: order.uuid, brick_amount: brickAmount, selectedPaymentMethod })
                    }).then(r => r.json());

                    // Step 2: If direct payment succeeds, redirect to success
                    if (!paymentResult.error && paymentResult.data?.status !== 'rejected') {
                      resolve();
                      if (paymentResult.data?.redirect_url) {
                        window.location.href = paymentResult.data.redirect_url;
                      } else {
                        window.location.href = `/checkout/success/${order.uuid}`;
                      }
                      return;
                    }

                    // Step 3: Fallback to Checkout Pro (preference + redirect)
                    // Used when direct payment is not available (sandbox/account restrictions)
                    const prefResult = await fetch(createMPPreferenceApi, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ order_id: order.uuid })
                    }).then(r => r.json());

                    if (prefResult.error || !prefResult.data) { reject(); return; }

                    resolve();
                    const redirectUrl = prefResult.data.is_sandbox
                      ? prefResult.data.sandbox_init_point
                      : prefResult.data.init_point;
                    window.location.href = redirectUrl;
                  } catch {
                    reject();
                  }
                })();
              });
            },
            onError: (err: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const e = err as any;
              // non_critical errors (e.g. no_payment_method_for_provided_bin) are
              // informational — the Brick handles them internally, don't destroy it.
              if (e?.type === 'non_critical') { console.warn('[MP Brick non-critical]', e); return; }
              console.error('[MP Brick]', err);
              if (cancelled) return;
              const message = e?.message || e?.cause?.message || (typeof err === 'string' ? err : null);
              const code = e?.type || e?.code;
              setBrickError(code ? `${code}: ${message ?? 'Error en el formulario.'}` : (message ?? 'Error en el formulario de pago.'));
            }
          }
        });
      } catch (e) {
        if (!cancelled) setBrickError((e as Error).message ?? 'Error inicializando el formulario.');
      }
    };

    initBrick();

    return () => {
      cancelled = true;
      brickRef.current?.unmount?.();
      brickRef.current = null;
    };
  }, [isMPSelected, getMPConfigApi, brickAmount]);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 15
};

export const query = `
  query MPQuery {
    getMPConfigApi: url(routeId: "getMPConfig")
    processMPPaymentApi: url(routeId: "processMPPayment")
    createMPPreferenceApi: url(routeId: "createMPPreference")
    cart: myCart {
      grandTotal {
        value
      }
    }
  }
`;
