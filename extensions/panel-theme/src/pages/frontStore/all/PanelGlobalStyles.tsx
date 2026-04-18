import React from 'react';

export default function PanelGlobalStyles() {
  return (
    <style>{`
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
    `}</style>
  );
}

export const layout = {
  areaId: 'head',
  sortOrder: 4
};
