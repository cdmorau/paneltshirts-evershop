import React, { useEffect } from 'react';

export default function BibliotecaIframe() {
  useEffect(() => {
    document.body.classList.add('panel-fullscreen-page');
    return () => {
      document.body.classList.remove('panel-fullscreen-page');
    };
  }, []);

  return (
    <div
      className="panel-fullscreen-iframe-wrap"
      style={{
        width: '100%',
        height: 'calc(100dvh - var(--panel-header-h, 64px))',
        backgroundColor: '#fff'
      }}
    >
      <iframe
        src="/biblioteca.html"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
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
