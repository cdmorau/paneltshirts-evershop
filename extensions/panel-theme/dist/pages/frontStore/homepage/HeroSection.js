import React from 'react';
const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';
export default function HeroSection() {
    return /*#__PURE__*/ React.createElement("section", {
        className: "relative w-full overflow-hidden",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)',
            minHeight: '80vh'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "absolute inset-0 opacity-30",
        style: {
            backgroundImage: `url(${CDN}/tshirt-collection-hero-Ua7NQtwwV2R5jewfCZV6WN.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }
    }), /*#__PURE__*/ React.createElement("div", {
        className: "relative z-10 flex flex-col items-center justify-center h-full px-6 py-24 text-center"
    }, /*#__PURE__*/ React.createElement("p", {
        className: "panel-cta-btn text-sm mb-4",
        style: {
            color: 'oklch(0.6 0 0)',
            letterSpacing: '0.2em'
        }
    }, "NUEVA COLECCIÓN"), /*#__PURE__*/ React.createElement("img", {
        src: "/logoPanel.svg",
        alt: "PANEL! T-Shirts",
        style: {
            height: '80px',
            width: 'auto',
            marginBottom: '1.5rem',
            filter: 'invert(1)'
        }
    }), /*#__PURE__*/ React.createElement("p", {
        className: "text-lg md:text-xl mb-10 max-w-md",
        style: {
            color: 'oklch(0.75 0 0)'
        }
    }, "Diseño urbano minimalista. Blanco sobre negro, negro sobre blanco."), /*#__PURE__*/ React.createElement("div", {
        className: "flex flex-col sm:flex-row gap-4"
    }, /*#__PURE__*/ React.createElement("a", {
        href: "/category/e205b353-513a-41ce-b3bd-290ab8343008",
        className: "panel-cta-btn px-8 py-3 text-sm",
        style: {
            backgroundColor: '#fff',
            color: 'oklch(0.141 0.005 285.823)',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "VER COLECCIÓN"), /*#__PURE__*/ React.createElement("a", {
        href: "/designer",
        className: "panel-cta-btn px-8 py-3 text-sm",
        style: {
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "DISEÑAR MI CAMISETA"))), /*#__PURE__*/ React.createElement("div", {
        className: "absolute bottom-0 left-0 right-0",
        style: {
            height: '80px',
            background: '#fff',
            clipPath: 'polygon(0 100%, 100% 0, 100% 100%)'
        }
    }));
}
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
