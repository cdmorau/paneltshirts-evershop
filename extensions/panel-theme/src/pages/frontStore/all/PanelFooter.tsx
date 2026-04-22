import React from 'react';

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  fontSize: '0.875rem',
};

export default function PanelFooter() {
  return (
    <footer
      className="py-12 px-6 panel-footer"
      style={{ backgroundColor: '#fff', borderTop: '1px solid oklch(0.92 0 0)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              PANEL!
            </h4>
            <p className="text-sm" style={{ color: 'oklch(0.5 0 0)', lineHeight: 1.6 }}>
              Camisetas personalizadas de diseño minimalista.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Tienda
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="space-y-2">
              <li><a href="/#featured" style={linkStyle}>Destacados</a></li>
              <li><a href="/category/e205b353-513a-41ce-b3bd-290ab8343008" style={linkStyle}>Catálogo</a></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Información
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="space-y-2">
              <li><a href="/#about" style={linkStyle}>Acerca de</a></li>
              <li><a href="/contacto" style={linkStyle}>Contacto</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="space-y-2">
              <li><a href="/privacidad" style={linkStyle}>Privacidad</a></li>
              <li><a href="/terminos" style={linkStyle}>Términos</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid oklch(0.92 0 0)', paddingTop: '2rem' }}>
          <p className="text-sm text-center" style={{ color: 'oklch(0.5 0 0)' }}>
            © 2026 PANEL! Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export const layout = {
  areaId: 'footerTop',
  sortOrder: 10,
};
