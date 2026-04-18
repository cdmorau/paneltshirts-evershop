import { insert } from '@evershop/postgres-query-builder';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';

const PRODUCTS = [
  {
    sku: 'panel-classic-black',
    name: 'PANEL! Classic Black',
    description: '<p>Camiseta negra premium con logo PANEL! en blanco. Diseño urbano minimalista perfecto para cualquier ocasión.</p>',
    short_description: 'Camiseta negra premium con logo PANEL! en blanco.',
    price: 29.99,
    qty: 100,
    url_key: 'panel-classic-black',
    image: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`
  },
  {
    sku: 'panel-classic-white',
    name: 'PANEL! Classic White',
    description: '<p>Camiseta blanca premium con logo PANEL! en negro. Diseño urbano minimalista con máximo contraste.</p>',
    short_description: 'Camiseta blanca premium con logo PANEL! en negro.',
    price: 29.99,
    qty: 100,
    url_key: 'panel-classic-white',
    image: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`
  },
  {
    sku: 'panel-duo-pack',
    name: 'PANEL! Duo Pack',
    description: '<p>Pack de dos camisetas: una negra y una blanca. Perfecto para tener el contraste completo de la marca.</p>',
    short_description: 'Pack de dos camisetas negra y blanca PANEL!',
    price: 49.99,
    qty: 50,
    url_key: 'panel-duo-pack',
    image: `${CDN}/tshirt-collection-hero-Ua7NQtwwV2R5jewfCZV6WN.webp`
  },
  {
    sku: 'panel-oversized-black',
    name: 'PANEL! Oversized Black',
    description: '<p>Camiseta oversized negra con logo PANEL! grande. Estilo urbano relajado y moderno.</p>',
    short_description: 'Camiseta oversized negra con logo PANEL! grande.',
    price: 34.99,
    qty: 80,
    url_key: 'panel-oversized-black',
    image: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`
  },
  {
    sku: 'panel-oversized-white',
    name: 'PANEL! Oversized White',
    description: '<p>Camiseta oversized blanca con logo PANEL! grande. Estilo urbano relajado y minimalista.</p>',
    short_description: 'Camiseta oversized blanca con logo PANEL! grande.',
    price: 34.99,
    qty: 80,
    url_key: 'panel-oversized-white',
    image: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`
  }
];

export default async (connection) => {
  for (const p of PRODUCTS) {
    // Insert product row
    const productResult = await insert('product')
      .given({
        sku: p.sku,
        price: p.price,
        qty: p.qty,
        weight: 0.3,
        manage_stock: true,
        stock_availability: true,
        visibility: true,
        status: true
      })
      .execute(connection);

    const productId = productResult.insertId;

    // Insert product description (name, url_key, description)
    await insert('product_description')
      .given({
        product_description_product_id: productId,
        name: p.name,
        description: p.description,
        short_description: p.short_description,
        url_key: p.url_key,
        meta_title: p.name,
        meta_description: p.short_description
      })
      .execute(connection);

    // Insert product image
    await insert('product_image')
      .given({
        product_image_product_id: productId,
        origin_image: p.image,
        is_main: true
      })
      .execute(connection);
  }
};
