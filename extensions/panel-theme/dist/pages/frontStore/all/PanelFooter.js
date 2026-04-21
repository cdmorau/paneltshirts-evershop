import React from 'react';
const linkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    fontSize: '0.875rem'
};
export default function PanelFooter() {
    return /*#__PURE__*/ React.createElement("footer", {
        className: "py-12 px-6",
        style: {
            backgroundColor: '#fff',
            borderTop: '1px solid oklch(0.92 0 0)'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-6xl mx-auto"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
    }, /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("h4", {
        className: "font-semibold mb-4 text-sm",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "PANEL!"), /*#__PURE__*/ React.createElement("p", {
        className: "text-sm",
        style: {
            color: 'oklch(0.5 0 0)',
            lineHeight: 1.6
        }
    }, "Camisetas personalizadas de diseño minimalista.")), /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("h4", {
        className: "font-semibold mb-4 text-sm",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "Tienda"), /*#__PURE__*/ React.createElement("ul", {
        style: {
            listStyle: 'none',
            margin: 0,
            padding: 0
        },
        className: "space-y-2"
    }, /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/#featured",
        style: linkStyle
    }, "Destacados")), /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/category/e205b353-513a-41ce-b3bd-290ab8343008",
        style: linkStyle
    }, "Catálogo")))), /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("h4", {
        className: "font-semibold mb-4 text-sm",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "Información"), /*#__PURE__*/ React.createElement("ul", {
        style: {
            listStyle: 'none',
            margin: 0,
            padding: 0
        },
        className: "space-y-2"
    }, /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/#about",
        style: linkStyle
    }, "Acerca de")), /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/contacto",
        style: linkStyle
    }, "Contacto")))), /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("h4", {
        className: "font-semibold mb-4 text-sm",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "Legal"), /*#__PURE__*/ React.createElement("ul", {
        style: {
            listStyle: 'none',
            margin: 0,
            padding: 0
        },
        className: "space-y-2"
    }, /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/privacidad",
        style: linkStyle
    }, "Privacidad")), /*#__PURE__*/ React.createElement("li", null, /*#__PURE__*/ React.createElement("a", {
        href: "/terminos",
        style: linkStyle
    }, "Términos"))))), /*#__PURE__*/ React.createElement("div", {
        style: {
            borderTop: '1px solid oklch(0.92 0 0)',
            paddingTop: '2rem'
        }
    }, /*#__PURE__*/ React.createElement("p", {
        className: "text-sm text-center",
        style: {
            color: 'oklch(0.5 0 0)'
        }
    }, "© 2026 PANEL! Todos los derechos reservados."))));
}
export const layout = {
    areaId: 'footerTop',
    sortOrder: 10
};
