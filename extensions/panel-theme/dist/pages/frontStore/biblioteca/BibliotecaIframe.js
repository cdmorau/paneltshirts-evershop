import React from 'react';
export default function BibliotecaIframe() {
    return /*#__PURE__*/ React.createElement("div", {
        className: "w-full",
        style: {
            height: 'calc(100vh - 80px)',
            backgroundColor: '#fff'
        }
    }, /*#__PURE__*/ React.createElement("iframe", {
        src: "/biblioteca.html",
        className: "w-full h-full border-none",
        title: "Biblioteca de Diseños PANEL!",
        allow: "fullscreen"
    }));
}
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
