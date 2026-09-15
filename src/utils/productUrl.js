export const productSlug = (product) => product?.slug || String(product?.id || '');

export const productPath = (product) => `/product/${encodeURIComponent(productSlug(product))}`;
