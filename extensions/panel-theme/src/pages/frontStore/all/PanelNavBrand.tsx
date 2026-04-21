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
        style={{ height: '44px', width: 'auto' }}
      />
    </a>
  );
}

export const layout = {
  areaId: 'headerMiddleLeft',
  sortOrder: 5
};
