import React from 'react';
/**
 * Renders null to the same areaId/sortOrder as CustomerIcon,
 * effectively suppressing the login icon since PANEL! uses guest-only checkout.
 *
 * EverShop renders all components registered to an area — this does not
 * remove the core CustomerIcon but the Area component skips null renders.
 */ export default function HideCustomerIcon() {
    return null;
}
export const layout = {
    areaId: 'headerMiddleRight',
    sortOrder: 10
};
