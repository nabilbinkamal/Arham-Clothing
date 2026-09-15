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
    addToCart(product, 'M'); // default size if not selected
    trackMetaEvent('AddToCart', { content_ids: [String(product.id)], content_name: product.title, content_type: 'product', value: Number(product.price) || 0, currency: 'BDT' });
    addToast(
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={product.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
        <div>
          <strong style={{ display: 'block', fontSize: '13px' }}>Added to Cart</strong>
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
    <div className="product-card">
      <div className="product-img-wrap">
        {/* Badges */}
        <div className="product-badges">
          {Boolean(product.isSale || product.is_sale) && <span className="badge badge-sale">SALE</span>}
          {product.tags && product.tags.split(',').map((tag, idx) => (
            <span key={idx} className="badge badge-custom">{tag.trim()}</span>
          ))}
        </div>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
            <span className="badge" style={{ background: 'var(--sale-red)', color: '#fff' }}>-{discountPercentage}%</span>
          </div>
        )}

        {/* Wishlist */}
        <button 
          className="wishlist-btn" 
          aria-label="Wishlist" 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          style={{ color: isFavorited ? '#ff0000' : '#111' }}
        >
          <Heart size={15} strokeWidth={2} fill={isFavorited ? '#ff0000' : 'none'} />
        </button>

        {/* Image */}
        <Link to={productPath(product)}>
          <img src={product.imageUrl} alt={product.title} loading="lazy" className={`product-img-primary ${hoverImage ? 'has-hover' : ''}`} />
          {hoverImage && (
            <img src={hoverImage} alt={product.title} loading="lazy" className="product-img-hover" />
          )}
        </Link>

        {/* Quick Add */}
        <div className="product-quick-actions">
          <button 
            className="quick-add-btn" 
            onClick={handleAddToCart}
            style={{ 
              transform: isAdding ? 'scale(0.95)' : 'scale(1)',
              background: isAdding ? '#2ecc71' : '#111',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={14} strokeWidth={2} />
            {isAdding ? 'ADDED!' : 'ADD TO CART'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <Link to={productPath(product)}>
          <p className="product-name">{product.title}</p>
        </Link>
        <div className="product-prices">
          <span className="price-current">৳{product.price}</span>
          {product.oldPrice && (
            <span className="price-old">৳{product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
