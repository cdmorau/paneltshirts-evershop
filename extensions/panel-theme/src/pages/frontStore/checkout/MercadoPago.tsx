import React, { useEffect } from 'react';

// MercadoPago logo SVG inline
const MPLogo = () => (
  <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="20" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#009EE3">
      MercadoPago
    </text>
  </svg>
);

interface CheckoutDispatch {
  registerPaymentComponent: (code: string, component: object) => void;
}

interface CheckoutContext {
  orderPlaced: boolean;
  orderId?: string;
  checkoutSuccessUrl?: string;
}

declare function useCheckoutDispatch(): CheckoutDispatch;
declare function useCheckoutContext(): CheckoutContext;

interface MercadoPagoProps {
  createMPPreferenceApi: string;
  isSandbox: boolean;
}

export default function MercadoPagoMethod({ createMPPreferenceApi, isSandbox }: MercadoPagoProps) {
  const { registerPaymentComponent } = useCheckoutDispatch();
  const { orderPlaced, orderId } = useCheckoutContext();

  // After order is placed, create MP preference and redirect
  useEffect(() => {
    if (!orderPlaced || !orderId) return;

    fetch(createMPPreferenceApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    })
      .then(r => r.json())
      .then(({ data, error }) => {
        if (error) {
          console.error('[MP] Error:', error.message);
          return;
        }
        // Use sandbox_init_point in dev, init_point in production
        const url = (isSandbox && data.sandbox_init_point) ? data.sandbox_init_point : data.init_point;
        window.location.href = url;
      })
      .catch(err => console.error('[MP] Network error:', err));
  }, [orderPlaced, orderId]);

  // Register payment UI components
  useEffect(() => {
    registerPaymentComponent('mercadopago', {
      nameRenderer: () => (
        <div className="flex items-center gap-2">
          <MPLogo />
        </div>
      ),
      formRenderer: () => (
        <div
          className="p-4 text-sm"
          style={{
            backgroundColor: 'oklch(0.97 0 0)',
            borderRadius: 'var(--radius)',
            color: 'oklch(0.4 0 0)'
          }}
        >
          <p>Serás redirigido a MercadoPago para completar tu pago de forma segura.</p>
          <p className="mt-1" style={{ color: 'oklch(0.55 0 0)', fontSize: '0.75rem' }}>
            Acepta tarjetas de crédito, débito, PSE, efecty y más.
          </p>
        </div>
      ),
      checkoutButtonRenderer: ({ onSuccess }: { onSuccess: () => void }) => (
        <button
          type="button"
          onClick={onSuccess}
          className="panel-cta-btn w-full py-3 text-sm"
          style={{
            backgroundColor: '#009EE3',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          PAGAR CON MERCADOPAGO
        </button>
      )
    });
  }, []);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 15
};

export const query = `
  query MPQuery {
    createMPPreferenceApi: url(routeId: "createMPPreference")
    isSandbox: storeConfig(path: "mp_sandbox")
  }
`;
