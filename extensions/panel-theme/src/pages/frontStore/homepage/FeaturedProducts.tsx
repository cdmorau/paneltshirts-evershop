import React from 'react';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';

interface Product {
  productId: number;
  name: string;
  price: { text: string };
  url: string;
  image?: { url: string; alt?: string };
}

interface FeaturedProductsProps {
  featuredProducts?: Product[];
}

export default function FeaturedProducts({ featuredProducts }: FeaturedProductsProps) {
  const fallback = [
    {
      productId: 1,
      name: 'PANEL! Classic Black',
      price: { text: '$29.99' },
      url: '/panel-classic-black',
      image: { url: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`, alt: 'PANEL! Classic Black' }
    },
    {
      productId: 2,
      name: 'PANEL! Classic White',
      price: { text: '$29.99' },
      url: '/panel-classic-white',
      image: { url: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`, alt: 'PANEL! Classic White' }
    }
  ];

  const products = (featuredProducts?.length ? featuredProducts : fallback).slice(0, 2);

  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#fff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="panel-cta-btn text-xs mb-3"
            style={{ color: 'oklch(0.5 0 0)', letterSpacing: '0.2em' }}
          >
            LO MÁS VENDIDO
          </p>
          <h2
            className="text-3xl md:text-4xl"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Colección Esencial
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <a
              key={product.productId}
              href={product.url}
              className="panel-product-card group block"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="aspect-square mb-4 overflow-hidden"
                style={{ backgroundColor: 'oklch(0.97 0 0)', borderRadius: 'var(--radius)' }}
              >
                {product.image && (
                  <img
                    src={product.image.url}
                    alt={product.image.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {product.name}
                </span>
                <span className="text-base">{product.price.text}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/catalog"
            className="panel-cta-btn text-sm px-8 py-3 inline-block"
            style={{
              backgroundColor: 'oklch(0.141 0.005 285.823)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 'var(--radius)'
            }}
          >
            VER TODO
          </a>
        </div>
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 20
};

export const query = `
  query FeaturedProducts {
    featuredProducts: products(
      filters: [{ key: "visibility", operation: eq, value: "1" }]
      page: 1
      pageSize: 2
    ) {
      items {
        productId
        name
        price { text }
        url
        image { url alt }
      }
    }
  }
`;
