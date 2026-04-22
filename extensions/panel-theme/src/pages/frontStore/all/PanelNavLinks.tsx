import React, { useState } from 'react';

const links = [
  { label: 'Destacados', href: '/#featured' },
  { label: 'Catálogo', href: '/category/e205b353-513a-41ce-b3bd-290ab8343008' },
  { label: 'Acerca de', href: '/#about' },
  { label: 'Diseñar', href: '/designer' },
  { label: 'Biblioteca', href: '/biblioteca' },
];

export default function PanelNavLinks() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Desktop */}
      <ul
        className="hidden md:flex items-center"
        style={{ listStyle: 'none', margin: 0, padding: 0, gap: '2rem' }}
      >
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              style={{
                textDecoration: 'none',
                color: 'oklch(0.141 0.005 285.823)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <div className="md:hidden" style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            lineHeight: 1,
            padding: '4px 8px',
            color: 'oklch(0.141 0.005 285.823)',
          }}
          aria-label="Menú"
        >
          &#9776;
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#fff',
              border: '1px solid oklch(0.92 0 0)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem',
              minWidth: '180px',
              zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.5rem 0',
                  textDecoration: 'none',
                  color: 'oklch(0.141 0.005 285.823)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid oklch(0.95 0 0)',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export const layout = {
  areaId: 'headerMiddleLeft',
  sortOrder: 10,
};
