import React from 'react';
const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663536276606/2gA9N3SUTCNiMQ2nCN28kq';
export default function FeaturedProducts({ featuredProducts }) {
    const fallback = [
        {
            productId: 1,
            name: 'PANEL! Classic Black',
            price: {
                text: '$29.99'
            },
            url: '/panel-classic-black',
            image: {
                url: `${CDN}/hero-tshirt-black-VAb85TSacToZiB7qub2tYX.webp`,
                alt: 'PANEL! Classic Black'
            }
        },
        {
            productId: 2,
            name: 'PANEL! Classic White',
            price: {
                text: '$29.99'
            },
            url: '/panel-classic-white',
            image: {
                url: `${CDN}/hero-tshirt-white-Hhu5LWugmUfRiTxv3AuJTJ.webp`,
                alt: 'PANEL! Classic White'
            }
        }
    ];
    const products = (featuredProducts?.length ? featuredProducts : fallback).slice(0, 2);
    return /*#__PURE__*/ React.createElement("section", {
        id: "featured",
        className: "py-20 px-6",
        style: {
            backgroundColor: '#fff'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-5xl mx-auto"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "max-w-5xl mx-auto text-left mb-12"
    }, /*#__PURE__*/ React.createElement("h2", {
        className: "text-5xl md:text-6xl font-bold mb-4",
        style: {
            fontFamily: "'Montserrat', sans-serif"
        }
    }, "Destacados"), /*#__PURE__*/ React.createElement("div", {
        className: "w-16 h-1 mb-12",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)'
        }
    })), /*#__PURE__*/ React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-8"
    }, products.map((product)=>/*#__PURE__*/ React.createElement("a", {
            key: product.productId,
            href: product.url,
            className: "panel-product-card group block",
            style: {
                textDecoration: 'none',
                color: 'inherit'
            }
        }, /*#__PURE__*/ React.createElement("div", {
            className: "aspect-square mb-4 overflow-hidden",
            style: {
                backgroundColor: 'oklch(0.97 0 0)',
                borderRadius: 'var(--radius)'
            }
        }, product.image && /*#__PURE__*/ React.createElement("img", {
            src: product.image.url,
            alt: product.image.alt || product.name,
            className: "w-full h-full object-cover"
        })), /*#__PURE__*/ React.createElement("div", {
            className: "flex justify-between items-center"
        }, /*#__PURE__*/ React.createElement("span", {
            className: "text-base font-semibold",
            style: {
                fontFamily: "'Montserrat', sans-serif"
            }
        }, product.name), /*#__PURE__*/ React.createElement("span", {
            className: "text-base"
        }, product.price.text))))), /*#__PURE__*/ React.createElement("div", {
        className: "text-center mt-12"
    }, /*#__PURE__*/ React.createElement("a", {
        href: "/category/e205b353-513a-41ce-b3bd-290ab8343008",
        className: "panel-cta-btn text-sm px-8 py-3 inline-block",
        style: {
            backgroundColor: 'oklch(0.141 0.005 285.823)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius)'
        }
    }, "VER TODO"))));
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
