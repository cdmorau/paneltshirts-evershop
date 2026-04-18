import { execute } from '@evershop/postgres-query-builder';

// Seed PANEL! T-Shirts products
// Migrated from paneltshirts/client/src/lib/products.ts
export default async function migratePanelProducts(connection) {
  const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';

  const products = [
    {
      sku: 'panel-classic-black',
      name: 'PANEL! Classic Black',
      description: 'Camiseta negra premium con logo PANEL! en blanco. Diseño urbano minimalista perfecto para cualquier ocasión.',
      price: 29.99,
      image: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`,
      status: 1,
      visibility: 1
    },
    {
      sku: 'panel-classic-white',
      name: 'PANEL! Classic White',
      description: 'Camiseta blanca premium con logo PANEL! en negro. Diseño urbano minimalista con máximo contraste.',
      price: 29.99,
      image: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`,
      status: 1,
      visibility: 1
    },
    {
      sku: 'panel-duo-pack',
      name: 'PANEL! Duo Pack',
      description: 'Pack de dos camisetas: una negra y una blanca. Perfecto para tener el contraste completo de la marca.',
      price: 49.99,
      image: `${CDN}/tshirt-collection-hero-Ua7NQtwwV2R5jewfCZV6WN.webp`,
      status: 1,
      visibility: 1
    },
    {
      sku: 'panel-oversized-black',
      name: 'PANEL! Oversized Black',
      description: 'Camiseta oversized negra con logo PANEL! grande. Estilo urbano relajado y moderno.',
      price: 34.99,
      image: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`,
      status: 1,
      visibility: 1
    },
    {
      sku: 'panel-oversized-white',
      name: 'PANEL! Oversized White',
      description: 'Camiseta oversized blanca con logo PANEL! grande. Estilo urbano relajado y minimalista.',
      price: 34.99,
      image: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`,
      status: 1,
      visibility: 1
    }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  for (const product of products) {
    const { rows: [{ product_id: productId }] } = await execute(connection, `
      INSERT INTO product (sku, name, description, price, status, visibility, url_key, created_at, updated_at)
      VALUES (
        '${product.sku}',
        '${product.name}',
        '${product.description.replace(/'/g, "''")}',
        ${product.price},
        ${product.status},
        ${product.visibility},
        '${product.sku}',
        NOW(),
        NOW()
      )
      ON CONFLICT (sku) DO NOTHING
      RETURNING product_id
    `);

    if (!productId) continue;

    // Add image
    await execute(connection, `
      INSERT INTO product_image (product_image_product_id, origin_image, is_main, sort_order)
      VALUES (${productId}, '${product.image}', TRUE, 0)
      ON CONFLICT DO NOTHING
    `);

    // Add size attribute values
    for (let i = 0; i < sizes.length; i++) {
      await execute(connection, `
        INSERT INTO product_attribute_value_index (product_id, attribute_code, option_text)
        VALUES (${productId}, 'size', '${sizes[i]}')
        ON CONFLICT DO NOTHING
      `);
    }
  }
}
