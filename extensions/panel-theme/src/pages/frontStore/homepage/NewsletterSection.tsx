import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: 'oklch(0.97 0 0)', borderTop: '1px solid oklch(0.92 0 0)' }}
    >
      <div className="max-w-lg mx-auto text-center">
        <h3
          className="text-2xl mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Únete al club PANEL!
        </h3>
        <p className="text-sm mb-6" style={{ color: 'oklch(0.45 0 0)' }}>
          Primeras noticias sobre nuevas colecciones, descuentos exclusivos y lanzamientos.
        </p>
        {submitted ? (
          <p
            className="panel-cta-btn text-sm py-3"
            style={{ color: 'oklch(0.141 0.005 285.823)' }}
          >
            ¡Gracias por suscribirte!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-2 text-sm"
              style={{
                border: '1px solid oklch(0.85 0 0)',
                borderRadius: 'var(--radius)',
                outline: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
            />
            <button
              type="submit"
              className="panel-cta-btn px-5 py-2 text-xs"
              style={{
                backgroundColor: 'oklch(0.141 0.005 285.823)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer'
              }}
            >
              SUSCRIBIR
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 50
};
