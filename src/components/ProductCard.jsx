import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { ToastContext } from '../context/ToastContext';
import { productPath } from '../utils/productUrl';
import { trackMetaEvent } from '../utils/metaPixel';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToast } = useContext(ToastContext);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');

  const isFavorited = isInWishlist(product.id);
  
  let hoverImage = null;
  if (product.gallery) {
    try {
      const parsed = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
      if (Array.isArray(parsed) && parsed.length > 0) hoverImage = parsed[0];
    } catch{}
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, selectedSize);
    trackMetaEvent('AddToCart', { content_ids: [String(product.id)], content_name: product.title, content_type: 'product', value: Number(product.price) || 0, currency: 'BDT' });
    addToast(
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={product.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
        <div>
          <strong style={{ display: 'block', fontSize: '13px' }}>Added to Cart ({selectedSize})</strong>
          <span style={{ fontSize: '11px', color: '#666' }}>{product.title}</span>
        </div>
      </div>,
      'success'
    );
    setTimeout(() => setIsAdding(false), 600);
  };
  
  let discountPercentage = 0;
  if (product.oldPrice && product.price && parseFloat(product.oldPrice) > parseFloat(product.price)) {
    discountPercentage = Math.round(((parseFloat(product.oldPrice) - parseFloat(product.price)) / parseFloat(product.oldPrice)) * 100);
  }
  
  return (
    <article className="arham-product-card">
      <div className="arham-product-image-wrap">
        <Link to={productPath(product)}>
          <img src={product.imageUrl} alt={product.title} loading="lazy" className={hoverImage ? 'has-hover' : ''} />
          {hoverImage && (
            <img src={hoverImage} alt={product.title} loading="lazy" className="product-img-hover" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, transition: 'opacity 0.6s ease' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0} />
          )}
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, pointerEvents: 'none' }}>
            <span style={{ background: '#ff3366', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '2px', fontWeight: 'bold' }}>-{discountPercentage}%</span>
          </div>
        )}

        <button 
          className="arham-product-wishlist" 
          aria-label="Wishlist" 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          style={{ color: isFavorited ? '#ff0000' : 'var(--arham-ink)', zIndex: 3 }}
        >
          <Heart size={16} strokeWidth={2} fill={isFavorited ? '#ff0000' : 'none'} />
        </button>
      </div>

      <div className="arham-product-info">
        <Link to={productPath(product)} className="arham-product-name">{product.title}</Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <p className="arham-product-price">৳ {Number(product.price).toLocaleString('en-BD')}</p>
          {product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price) && (
             <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px' }}>৳ {Number(product.oldPrice).toLocaleString('en-BD')}</span>
          )}
        </div>
        
        <div className="arham-size-picker">
          {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <button 
              key={size} 
              className={selectedSize === size ? 'selected' : ''} 
              onClick={(e) => {
                e.preventDefault();
                setSelectedSize(size);
              }}
            >
              {size}
            </button>
          ))}
        </div>
        
        <button 
          className="arham-button arham-add-button" 
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            marginTop: '10px',
            background: isAdding ? '#2ecc71' : '',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleAddToCart}
        >
          {isAdding ? 'ADDED!' : 'ADD TO CART'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
