import React from 'react';
export default function PanelOrderConfirmation({ order }) {
    return /*#__PURE__*/ React.createElement("section", {
        className: "py-20 px-6",
        style: {
            backgroundColor: '#fff',
            minHeight: '60vh'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-lg mx-auto text-center"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)'
        }
    }, /*#__PURE__*/ React.createElement("svg", {
        width: "28",
        height: "28",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "2.5"
    }, /*#__PURE__*/ React.createElement("polyline", {
        points: "20 6 9 17 4 12"
    }))), /*#__PURE__*/ React.createElement("h1", {
        className: "text-3xl mb-3",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "¡Pedido confirmado!"), order?.orderNumber && /*#__PURE__*/ React.createElement("p", {
        className: "text-sm mb-2",
        style: {
            color: 'oklch(0.45 0 0)'
        }
    }, "Orden ", /*#__PURE__*/ React.createElement("strong", null, "#", order.orderNumber)), order?.customerEmail && /*#__PURE__*/ React.createElement("p", {
        className: "text-sm mb-6",
        style: {
            color: 'oklch(0.45 0 0)'
        }
    }, "Recibirás la confirmación en ", /*#__PURE__*/ React.createElement("strong", null, order.customerEmail)), order?.grandTotal && /*#__PURE__*/ React.createElement("p", {
        className: "text-xl font-semibold mb-8",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "Total: ", order.grandTotal.text), /*#__PURE__*/ React.createElement("div", {
        className: "p-5 mb-8 text-left text-sm",
        style: {
            backgroundColor: 'oklch(0.97 0 0)',
            borderRadius: 'var(--radius)',
            color: 'oklch(0.4 0 0)',
            lineHeight: 1.7
        }
    }, /*#__PURE__*/ React.createElement("p", null, "✓ Te enviaremos un email con el seguimiento de tu pedido."), /*#__PURE__*/ React.createElement("p", null, "✓ Tiempo estimado de entrega: 3-5 días hábiles."), /*#__PURE__*/ React.createElement("p", null, "✓ Sin necesidad de crear una cuenta.")), /*#__PURE__*/ React.createElement("div", {
        className: "flex flex-col sm:flex-row gap-3 justify-center"
    }, /*#__PURE__*/ React.createElement("a", {
        href: "/catalog",
        className: "panel-cta-btn text-sm px-8 py-3 inline-block",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "SEGUIR COMPRANDO"), /*#__PURE__*/ React.createElement("a", {
        href: "/",
        className: "panel-cta-btn text-sm px-8 py-3 inline-block",
        style: {
            backgroundColor: 'transparent',
            color: 'oklch(0.141 0.005 285.823)',
            border: '1px solid oklch(0.85 0 0)',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "IR AL INICIO"))));
}
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
export const query = `
  query PanelOrderConfirmation {
    order(uuid: getContextValue('orderId', null)) {
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
