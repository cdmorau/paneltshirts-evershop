import React from 'react';

export default function PanelNavBrand() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 no-underline"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <span
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'oklch(0.141 0.005 285.823)',
          lineHeight: 1
        }}
      >
        PANEL!
      </span>
    </a>
  );
}

export const layout = {
  areaId: 'headerMiddleCenter',
  sortOrder: 5
};
