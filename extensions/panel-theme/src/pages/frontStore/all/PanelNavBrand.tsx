import React from 'react';

export default function PanelNavBrand() {
  return (
    <a
      href="/"
      className="flex items-center no-underline"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <img
        src="/logoPanel.svg"
        alt="PANEL! T-Shirts"
        style={{ height: '40px', width: 'auto' }}
      />
    </a>
  );
}

export const layout = {
  areaId: 'headerMiddleCenter',
  sortOrder: 5
};
