import React, { useState } from 'react';

interface Product {
  uuid: string;
  sku: string;
  name: string;
  price: { regular: { value: number; text: string } };
  updateApi: string;
}

interface ProductPricesProps {
  products: {
    items: Product[];
  };
}

export default function ProductPrices({ products: { items: products } }: ProductPricesProps) {
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    products.forEach(p => {
      initial[p.uuid] = String(Math.round(p.price?.regular?.value ?? 0));
    });
    return initial;
  });
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, 'saved' | 'error' | null>>({});

  const updatePrice = async (product: Product) => {
    const newPrice = prices[product.uuid];
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) < 0) return;

    setSaving(s => ({ ...s, [product.uuid]: true }));
    setStatus(s => ({ ...s, [product.uuid]: null }));

    try {
      const res = await fetch(product.updateApi, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(newPrice) })
      });
      const data = await res.json();
      if (data.error) {
        setStatus(s => ({ ...s, [product.uuid]: 'error' }));
      } else {
        setStatus(s => ({ ...s, [product.uuid]: 'saved' }));
        setTimeout(() => setStatus(s => ({ ...s, [product.uuid]: null })), 3000);
      }
    } catch {
      setStatus(s => ({ ...s, [product.uuid]: 'error' }));
    }

    setSaving(s => ({ ...s, [product.uuid]: false }));
  };

  const getButtonLabel = (uuid: string) => {
    if (saving[uuid]) return 'Guardando...';
    if (status[uuid] === 'saved') return '✓ Guardado';
    if (status[uuid] === 'error') return '✗ Error';
    return 'Guardar';
  };

  const getButtonStyle = (uuid: string): React.CSSProperties => {
    if (status[uuid] === 'saved') return { backgroundColor: '#16a34a' };
    if (status[uuid] === 'error') return { backgroundColor: '#dc2626' };
    return {};
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Editar Precios de Productos
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Todos los precios en COP (pesos colombianos). Presiona Enter o haz clic en Guardar.
        </p>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Producto
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                SKU
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Precio (COP $)
              </th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p.uuid} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>{p.sku}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={prices[p.uuid]}
                    onChange={e => setPrices(prev => ({ ...prev, [p.uuid]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') updatePrice(p); }}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      width: '10rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button
                    onClick={() => updatePrice(p)}
                    disabled={saving[p.uuid]}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 1rem',
                      fontSize: '0.875rem',
                      cursor: saving[p.uuid] ? 'not-allowed' : 'pointer',
                      opacity: saving[p.uuid] ? 0.6 : 1,
                      transition: 'background-color 0.2s',
                      ...getButtonStyle(p.uuid)
                    }}
                  >
                    {getButtonLabel(p.uuid)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    products(filters: [{ key: "limit", operation: "eq", value: "100" }]) {
      items {
        uuid
        name
        sku
        price {
          regular {
            value
            text
          }
        }
        updateApi
      }
    }
  }
`;
