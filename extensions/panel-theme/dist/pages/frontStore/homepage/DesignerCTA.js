import React from 'react';
export default function DesignerCTA() {
    return /*#__PURE__*/ React.createElement("section", {
        className: "py-20 px-6",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-3xl mx-auto text-center"
    }, /*#__PURE__*/ React.createElement("p", {
        className: "panel-cta-btn text-xs mb-4",
        style: {
            color: 'oklch(0.5 0 0)',
            letterSpacing: '0.2em'
        }
    }, "PERSONALIZA"), /*#__PURE__*/ React.createElement("h2", {
        className: "text-3xl md:text-4xl mb-6",
        style: {
            fontFamily: "'Montserrat', sans-serif",
            color: '#fff',
            lineHeight: 1.1
        }
    }, "Diseña tu", /*#__PURE__*/ React.createElement("br", null), "propia camiseta"), /*#__PURE__*/ React.createElement("p", {
        className: "text-base mb-10 max-w-md mx-auto",
        style: {
            color: 'oklch(0.65 0 0)'
        }
    }, "Usa nuestro diseñador online para crear una camiseta única con tu estilo personal."), /*#__PURE__*/ React.createElement("a", {
        href: "/designer",
        className: "panel-cta-btn text-sm px-10 py-4 inline-block",
        style: {
            backgroundColor: '#fff',
            color: 'oklch(0.141 0.005 285.823)',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "ABRIR DISEÑADOR")));
}
export const layout = {
    areaId: 'content',
    sortOrder: 30
};
