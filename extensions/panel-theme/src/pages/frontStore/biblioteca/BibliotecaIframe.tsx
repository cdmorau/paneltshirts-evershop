import React from 'react';

export default function BibliotecaIframe() {
  return (
    <div
      className="w-full"
      style={{ height: 'calc(100vh - 80px)', backgroundColor: '#fff' }}
    >
      <iframe
        src="/biblioteca.html"
        className="w-full h-full border-none"
        title="Biblioteca de Diseños PANEL!"
        allow="fullscreen"
      />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
