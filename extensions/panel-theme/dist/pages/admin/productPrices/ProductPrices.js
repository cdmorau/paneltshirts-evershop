import React, { useState } from 'react';
export default function ProductPrices({ products: { items: products } }) {
    const [prices, setPrices] = useState(()=>{
        const initial = {};
        products.forEach((p)=>{
            initial[p.uuid] = String(Math.round(p.price?.regular?.value ?? 0));
        });
        return initial;
    });
    const [saving, setSaving] = useState({});
    const [status, setStatus] = useState({});
    const updatePrice = async (product)=>{
        const newPrice = prices[product.uuid];
        if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) < 0) return;
        setSaving((s)=>({
                ...s,
                [product.uuid]: true
            }));
        setStatus((s)=>({
                ...s,
                [product.uuid]: null
            }));
        try {
            const res = await fetch(product.updateApi, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: Number(newPrice)
                })
            });
            const data = await res.json();
            if (data.error) {
                setStatus((s)=>({
                        ...s,
                        [product.uuid]: 'error'
                    }));
            } else {
                setStatus((s)=>({
                        ...s,
                        [product.uuid]: 'saved'
                    }));
                setTimeout(()=>setStatus((s)=>({
                            ...s,
                            [product.uuid]: null
                        })), 3000);
            }
        } catch  {
            setStatus((s)=>({
                    ...s,
                    [product.uuid]: 'error'
                }));
        }
        setSaving((s)=>({
                ...s,
                [product.uuid]: false
            }));
    };
    const getButtonLabel = (uuid)=>{
        if (saving[uuid]) return 'Guardando...';
        if (status[uuid] === 'saved') return '✓ Guardado';
        if (status[uuid] === 'error') return '✗ Error';
        return 'Guardar';
    };
    const getButtonStyle = (uuid)=>{
        if (status[uuid] === 'saved') return {
            backgroundColor: '#16a34a'
        };
        if (status[uuid] === 'error') return {
            backgroundColor: '#dc2626'
        };
        return {};
    };
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            padding: '1.5rem'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        style: {
            marginBottom: '1.5rem'
        }
    }, /*#__PURE__*/ React.createElement("h2", {
        style: {
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.25rem'
        }
    }, "Editar Precios de Productos"), /*#__PURE__*/ React.createElement("p", {
        style: {
            color: '#6b7280',
            fontSize: '0.875rem'
        }
    }, "Todos los precios en COP (pesos colombianos). Presiona Enter o haz clic en Guardar.")), /*#__PURE__*/ React.createElement("div", {
        style: {
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            overflow: 'hidden'
        }
    }, /*#__PURE__*/ React.createElement("table", {
        style: {
            width: '100%',
            borderCollapse: 'collapse'
        }
    }, /*#__PURE__*/ React.createElement("thead", {
        style: {
            backgroundColor: '#f9fafb'
        }
    }, /*#__PURE__*/ React.createElement("tr", null, /*#__PURE__*/ React.createElement("th", {
        style: {
            textAlign: 'left',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#374151',
            borderBottom: '1px solid #e5e7eb'
        }
    }, "Producto"), /*#__PURE__*/ React.createElement("th", {
        style: {
            textAlign: 'left',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#374151',
            borderBottom: '1px solid #e5e7eb'
        }
    }, "SKU"), /*#__PURE__*/ React.createElement("th", {
        style: {
            textAlign: 'left',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#374151',
            borderBottom: '1px solid #e5e7eb'
        }
    }, "Precio (COP $)"), /*#__PURE__*/ React.createElement("th", {
        style: {
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e5e7eb'
        }
    }))), /*#__PURE__*/ React.createElement("tbody", null, products.map((p, idx)=>/*#__PURE__*/ React.createElement("tr", {
            key: p.uuid,
            style: {
                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb'
            }
        }, /*#__PURE__*/ React.createElement("td", {
            style: {
                padding: '0.875rem 1rem',
                fontWeight: 500
            }
        }, p.name), /*#__PURE__*/ React.createElement("td", {
            style: {
                padding: '0.875rem 1rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
            }
        }, p.sku), /*#__PURE__*/ React.createElement("td", {
            style: {
                padding: '0.875rem 1rem'
            }
        }, /*#__PURE__*/ React.createElement("input", {
            type: "number",
            min: 0,
            step: 1000,
            value: prices[p.uuid],
            onChange: (e)=>setPrices((prev)=>({
                        ...prev,
                        [p.uuid]: e.target.value
                    })),
            onKeyDown: (e)=>{
                if (e.key === 'Enter') updatePrice(p);
            },
            style: {
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                padding: '0.375rem 0.75rem',
                width: '10rem',
                fontSize: '0.875rem'
            }
        })), /*#__PURE__*/ React.createElement("td", {
            style: {
                padding: '0.875rem 1rem'
            }
        }, /*#__PURE__*/ React.createElement("button", {
            onClick: ()=>updatePrice(p),
            disabled: saving[p.uuid],
            style: {
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
            }
        }, getButtonLabel(p.uuid)))))))));
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
