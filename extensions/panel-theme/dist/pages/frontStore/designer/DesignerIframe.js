import React from 'react';
export default function DesignerIframe() {
    return /*#__PURE__*/ React.createElement("div", {
        className: "w-full",
        style: {
            height: 'calc(100vh - 80px)',
            backgroundColor: '#fff'
        }
    }, /*#__PURE__*/ React.createElement("iframe", {
        src: "/designer.html",
        className: "w-full h-full border-none",
        title: "Diseñador de Camisetas PANEL!",
        allow: "fullscreen"
    }));
}
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
