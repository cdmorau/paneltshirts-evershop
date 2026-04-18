import React from 'react';
export default function PanelNavBrand() {
    return /*#__PURE__*/ React.createElement("a", {
        href: "/",
        className: "flex items-center no-underline",
        style: {
            display: 'flex',
            alignItems: 'center'
        }
    }, /*#__PURE__*/ React.createElement("img", {
        src: "/logoPanel.svg",
        alt: "PANEL! T-Shirts",
        style: {
            height: '40px',
            width: 'auto'
        }
    }));
}
export const layout = {
    areaId: 'headerMiddleCenter',
    sortOrder: 5
};
