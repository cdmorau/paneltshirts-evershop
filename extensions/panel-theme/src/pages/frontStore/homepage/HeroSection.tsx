import React from 'react';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';

export default function HeroSection() {
  return (
    <section
      className="w-full px-6 py-20 md:py-32"
      style={{ background: 'linear-gradient(to bottom, oklch(0.95 0 0), #fff)' }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <h1
            className="text-6xl md:text-7xl font-bold mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif", lineHeight: 1.05, color: 'oklch(0.141 0.005 285.823)' }}
          >
            PANEL!
          </h1>
          <p
            className="text-lg mb-10 max-w-sm"
            style={{ color: 'oklch(0.45 0 0)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}
          >
            Diseño urbano minimalista. Camisetas con carácter, blanco sobre negro, negro sobre blanco.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/biblioteca"
              className="panel-cta-btn px-8 py-3 text-sm text-center"
              style={{
                backgroundColor: 'oklch(0.141 0.005 285.823)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 'var(--radius)',
              }}
            >
              BIBLIOTECA DE PANELES
            </a>
            <a
              href="/designer"
              className="panel-cta-btn px-8 py-3 text-sm text-center"
              style={{
                backgroundColor: 'transparent',
                color: 'oklch(0.141 0.005 285.823)',
                border: '1px solid oklch(0.141 0.005 285.823)',
                textDecoration: 'none',
                borderRadius: 'var(--radius)',
              }}
            >
              DISEÑAR
            </a>
            <a
              href="/category/e205b353-513a-41ce-b3bd-290ab8343008"
              className="panel-cta-btn px-8 py-3 text-sm text-center"
              style={{
                backgroundColor: 'transparent',
                color: 'oklch(0.45 0 0)',
                border: '1px solid oklch(0.80 0 0)',
                textDecoration: 'none',
                borderRadius: 'var(--radius)',
              }}
            >
              VER CATÁLOGO
            </a>
          </div>
        </div>

        {/* Right: Image (desktop only) */}
        <div className="hidden md:flex justify-center">
          <img
            src={`${CDN}/tshirt-collection-hero-Ua7NQtwwV2R5jewfCZV6WN.webp`}
            alt="PANEL! T-Shirts collection"
            className="w-full max-w-md"
            style={{ borderRadius: 'calc(var(--radius) * 3)', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', objectFit: 'cover' }}
          />
        </div>
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10,
};
