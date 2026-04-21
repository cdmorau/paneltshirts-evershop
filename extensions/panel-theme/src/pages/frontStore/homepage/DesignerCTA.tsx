import React from 'react';

export default function DesignerCTA() {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: 'oklch(0.141 0.005 285.823)' }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <div>
          <h2
            className="text-3xl md:text-4xl mb-6"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Diseña tu<br />propia camiseta
          </h2>
          <p
            className="text-base mb-10 max-w-md"
            style={{ color: 'oklch(0.65 0 0)' }}
          >
            Usa nuestro diseñador online para crear una camiseta única con tu estilo personal.
          </p>
          <a
            href="/designer"
            className="panel-cta-btn text-sm px-10 py-4 inline-block"
            style={{
              backgroundColor: '#fff',
              color: 'oklch(0.141 0.005 285.823)',
              textDecoration: 'none',
              borderRadius: 'var(--radius)',
            }}
          >
            ABRIR DISEÑADOR
          </a>
        </div>

        {/* Right: 2×2 SVG grid (desktop only) */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <img
              key={n}
              src={`/images/Panel-Web-0${n}.svg`}
              className="w-full h-auto rounded"
              style={{
                filter: 'invert(1)',
                opacity: 0.9,
                transition: 'transform 300ms ease',
              }}
              alt={`Panel design ${n}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 30,
};
