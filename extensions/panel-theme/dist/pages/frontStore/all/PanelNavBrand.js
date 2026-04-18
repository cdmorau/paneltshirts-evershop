import React from 'react';
export default function PanelNavBrand() {
    return /*#__PURE__*/ React.createElement("a", {
        href: "/",
        className: "flex items-center gap-2 no-underline",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, /*#__PURE__*/ React.createElement("span", {
        style: {
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'oklch(0.141 0.005 285.823)',
            lineHeight: 1
        }
    }, "PANEL!"));
}
export const layout = {
    areaId: 'headerMiddleCenter',
    sortOrder: 5
};
