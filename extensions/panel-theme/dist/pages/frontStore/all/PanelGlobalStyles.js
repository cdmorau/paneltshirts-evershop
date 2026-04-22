import React from 'react';
export default function PanelGlobalStyles() {
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Inter:wght@400;500&display=swap');

      :root {
        --background: oklch(1 0 0);
        --foreground: oklch(0.141 0.005 285.823);
        --secondary: oklch(0.95 0 0);
        --muted: oklch(0.92 0 0);
        --border: oklch(0.92 0 0);
        --primary: oklch(0.141 0.005 285.823);
        --primary-foreground: oklch(1 0 0);
        --destructive: oklch(0.577 0.245 27.325);
        --radius: 0.35rem;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      body { font-family: 'Inter', sans-serif; }
      .panel-product-card { transition: transform 300ms ease, box-shadow 300ms ease; }
      .panel-product-card:hover { transform: scale(1.02); box-shadow: 0 10px 25px rgba(0,0,0,0.12); }
      .panel-cta-btn { font-family: 'Montserrat', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }

      html { scroll-behavior: smooth; }

      header.header {
        position: sticky;
        top: 0;
        z-index: 30;
        background: #fff;
        border-bottom: 1px solid oklch(0.92 0 0);
      }

      /* Ocultar íconos no implementados (búsqueda y cuenta de usuario) */
      .search__box,
      .customer-icon { display: none !important; }

      /* Ocultar el botón "Debug: ON/OFF" del modo dev de EverShop Areas */
      button[title="Toggle Area debug mode"] { display: none !important; }

      /* ══════════════════════════════════════════════
         CATÁLOGO (Category View) — grid más denso
         ══════════════════════════════════════════════ */

      /* Ocultar la columna lateral de filtros — simplifica mobile y da más espacio */
      .category__page__top .page-width,
      body:has(.category__products__before) .md\\:col-span-1 { display: none !important; }

      /* Ocultar el título "Colección X" — redundante con el logo del header */
      .category__general,
      .category__info,
      .category__name { display: none !important; }

      /* Expandir la columna derecha para ocupar todo el ancho */
      body:has(.category__products__before) .md\\:col-span-3 {
        grid-column: 1 / -1 !important;
      }

      /* Contenedor del listado: max-width + centrado + padding lateral */
      body:has(.category__products__before) .page-width.grid {
        max-width: 1400px;
        margin: 0 auto !important;
        padding: 20px 16px !important;
      }
      @media (max-width: 767px) {
        body:has(.category__products__before) .page-width.grid {
          padding: 12px 10px !important;
        }
      }

      /* Grid de productos: 2 cols en mobile, 3 en tablet, 4 en desktop */
      .product__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
      }
      @media (min-width: 768px) {
        .product__grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 18px !important;
        }
      }
      @media (min-width: 1024px) {
        .product__grid {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 24px !important;
        }
      }

      /* Evitar que el overflow-hidden del card recorte el botón Add to Cart */
      .product__list__item__inner { overflow: visible !important; display: flex !important; flex-direction: column; }
      .product__list__item__inner .product__list__link { flex: 1; display: block; }
      .product__list__item__inner .product__list__image { overflow: hidden; border-radius: var(--radius); }

      /* Producto individual en el grid: más compacto */
      .product__list__item__inner .product__list__name {
        font-size: 0.85rem !important;
        font-weight: 600;
        margin-top: 6px;
        line-height: 1.3;
      }
      .product__list__item__inner .product__list__price {
        font-size: 0.9rem !important;
        margin-top: 2px;
      }
      .product__list__item__inner .regular-price { font-weight: 600; }

      /* Botón "Add to Cart" siempre visible (no hover-only) */
      .product__list__item__inner .product__list__actions {
        visibility: visible !important;
        opacity: 1 !important;
        transform: none !important;
        padding: 0 !important;
        margin-top: 8px;
        position: static !important;
      }
      .product__list__item__inner .product__list__actions button {
        width: 100%;
        padding: 6px 10px;
        font-size: 11px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        background: oklch(0.141 0.005 285.823);
        color: #fff;
        border: none;
        border-radius: var(--radius);
        cursor: pointer;
        transition: background .15s;
      }
      .product__list__item__inner .product__list__actions button:hover {
        background: #333;
      }
      .product__list__item__inner .product__list__actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Ocultar el logo por defecto de EverShop — usamos nuestro PanelNavBrand */
      .header__middle__center > .logo,
      .header__middle__center > .logo .logo-icon { display: none !important; }

      .header__middle {
        grid-template-columns: auto 1fr auto;
      }

      /* Desktop header: logo IZQUIERDA, nav CENTRO, carrito DERECHA
         (los componentes están registrados con PanelNavLinks=Left y PanelNavBrand=Center
         — en desktop invertimos el orden visual con flex + order) */
      @media (min-width: 768px) {
        .header__middle {
          display: flex !important;
          grid-template-columns: none !important;
          align-items: center;
          gap: 24px;
        }
        .header__middle__center { order: 1; flex: 0 0 auto; justify-content: flex-start !important; }
        .header__middle__left { order: 2; flex: 1; justify-content: center !important; }
        .header__middle__right { order: 3; flex: 0 0 auto; justify-content: flex-end !important; }
      }

      /* Mobile header: menu-IZQUIERDA, logo PANEL CENTRO (pequeño), carrito DERECHA */
      @media (max-width: 767px) {
        header.header { padding: 6px 10px !important; }
        .header__middle { grid-template-columns: 1fr auto 1fr !important; align-items: center; }
        .header__middle__left { justify-content: flex-start !important; }
        .header__middle__center { justify-content: center !important; }
        .header__middle__right { justify-content: flex-end !important; }
        /* Reducir tamaño del logo PANEL en mobile */
        .header__middle__center a img[alt="PANEL! T-Shirts"] {
          height: 28px !important;
        }
        .header__top { display: none !important; }
      }

      footer.footer {
        background: #fff;
        border-top: 1px solid oklch(0.92 0 0);
        margin-top: 0;
      }

      /* Ocultar breadcrumb de EverShop en todas las páginas */
      .page-width:has(nav[aria-label="breadcrumb"]) { display: none; }

      /* Footer solo visible en home */
      body.panel-not-home footer.footer { display: none !important; }

      /* Designer/biblioteca: header visible, footer oculto, iframe ocupa resto de viewport */
      body.panel-fullscreen-page { overflow: hidden; }
      body.panel-fullscreen-page footer.footer { display: none !important; }
      body.panel-fullscreen-page .page-width { padding: 0 !important; margin: 0 !important; max-width: none !important; }
      body.panel-fullscreen-page .content { padding: 0 !important; margin: 0 !important; }
      body.panel-fullscreen-page .panel-fullscreen-iframe-wrap { display: block; }
      `), /*#__PURE__*/ React.createElement("script", {
        dangerouslySetInnerHTML: {
            __html: `
        (function() {
          function apply() {
            var p = location.pathname;
            var isHome = (p === '/' || p === '' || p === '/home');
            document.body.classList.toggle('panel-not-home', !isHome);
            var hdr = document.querySelector('header.header');
            if (hdr) {
              var h = hdr.getBoundingClientRect().height || 64;
              document.documentElement.style.setProperty('--panel-header-h', h + 'px');
            }
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', apply);
          } else {
            apply();
          }
          window.addEventListener('popstate', apply);
          window.addEventListener('resize', apply);
        })();
      `
        }
    }));
}
export const layout = {
    areaId: 'head',
    sortOrder: 4
};

