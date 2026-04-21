import React, { useState } from 'react';
export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (email) setSubmitted(true);
    };
    return /*#__PURE__*/ React.createElement("section", {
        className: "py-16 px-6",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-lg mx-auto text-center"
    }, /*#__PURE__*/ React.createElement("h3", {
        className: "text-2xl mb-3",
        style: {
            fontFamily: "'Montserrat', sans-serif",
            color: '#fff'
        }
    }, "Únete al club PANEL!"), /*#__PURE__*/ React.createElement("p", {
        className: "text-sm mb-6",
        style: {
            color: 'oklch(0.65 0 0)'
        }
    }, "Primeras noticias sobre nuevas colecciones, descuentos exclusivos y lanzamientos."), submitted ? /*#__PURE__*/ React.createElement("p", {
        className: "panel-cta-btn text-sm py-3",
        style: {
            color: '#fff'
        }
    }, "¡Gracias por suscribirte!") : /*#__PURE__*/ React.createElement("form", {
        onSubmit: handleSubmit,
        className: "flex gap-2 max-w-sm mx-auto"
    }, /*#__PURE__*/ React.createElement("input", {
        type: "email",
        value: email,
        onChange: (e)=>setEmail(e.target.value),
        placeholder: "tu@email.com",
        required: true,
        className: "flex-1 px-4 py-2 text-sm",
        style: {
            border: '1px solid rgba(255,255,255,0.3)',
            backgroundColor: '#fff',
            color: 'oklch(0.141 0.005 285.823)',
            borderRadius: 'var(--radius)',
            outline: 'none',
            fontFamily: "'Inter', sans-serif"
        }
    }), /*#__PURE__*/ React.createElement("button", {
        type: "submit",
        className: "panel-cta-btn px-5 py-2 text-xs",
        style: {
            backgroundColor: '#fff',
            color: 'oklch(0.141 0.005 285.823)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer'
        }
    }, "SUSCRIBIR"))));
}
export const layout = {
    areaId: 'content',
    sortOrder: 50
};
