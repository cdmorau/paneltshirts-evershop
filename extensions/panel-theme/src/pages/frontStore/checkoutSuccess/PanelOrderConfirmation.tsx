import React from 'react';

interface OrderData {
  orderNumber?: string;
  grandTotal?: { text: string };
  customerEmail?: string;
  shippingAddress?: {
    fullName: string;
    city: string;
    country: { name: string };
  };
}

interface PanelOrderConfirmationProps {
  order?: OrderData;
}

export default function PanelOrderConfirmation({ order }: PanelOrderConfirmationProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#fff', minHeight: '60vh' }}>
      <div className="max-w-lg mx-auto text-center">
        {/* Checkmark */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'oklch(0.141 0.005 285.823)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1
          className="text-3xl mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          ¡Pedido confirmado!
        </h1>

        {order?.orderNumber && (
          <p className="text-sm mb-2" style={{ color: 'oklch(0.45 0 0)' }}>
            Orden <strong>#{order.orderNumber}</strong>
          </p>
        )}

        {order?.customerEmail && (
          <p className="text-sm mb-6" style={{ color: 'oklch(0.45 0 0)' }}>
            Recibirás la confirmación en <strong>{order.customerEmail}</strong>
          </p>
        )}

        {order?.grandTotal && (
          <p className="text-xl font-semibold mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Total: {order.grandTotal.text}
          </p>
        )}

        <div
          className="p-5 mb-8 text-left text-sm"
          style={{
            backgroundColor: 'oklch(0.97 0 0)',
            borderRadius: 'var(--radius)',
            color: 'oklch(0.4 0 0)',
            lineHeight: 1.7
          }}
        >
          <p>✓ Te enviaremos un email con el seguimiento de tu pedido.</p>
          <p>✓ Tiempo estimado de entrega: 3-5 días hábiles.</p>
          <p>✓ Sin necesidad de crear una cuenta.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/catalog"
            className="panel-cta-btn text-sm px-8 py-3 inline-block"
            style={{
              backgroundColor: 'oklch(0.141 0.005 285.823)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 'var(--radius)'
            }}
          >
            SEGUIR COMPRANDO
          </a>
          <a
            href="/"
            className="panel-cta-btn text-sm px-8 py-3 inline-block"
            style={{
              backgroundColor: 'transparent',
              color: 'oklch(0.141 0.005 285.823)',
              border: '1px solid oklch(0.85 0 0)',
              textDecoration: 'none',
              borderRadius: 'var(--radius)'
            }}
          >
            IR AL INICIO
          </a>
        </div>
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query PanelOrderConfirmation($orderId: String) {
    order(uuid: $orderId) {
      orderNumber
      grandTotal { text }
      customerEmail
      shippingAddress {
        fullName
        city
        country { name }
      }
    }
  }
`;
