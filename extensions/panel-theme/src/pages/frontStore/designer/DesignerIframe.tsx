import React from 'react';

export default function DesignerIframe() {
  return (
    <div
      className="w-full"
      style={{ height: 'calc(100vh - 80px)', backgroundColor: '#fff' }}
    >
      <iframe
        src="/designer.html"
        className="w-full h-full border-none"
        title="Diseñador de Camisetas PANEL!"
        allow="fullscreen"
      />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
