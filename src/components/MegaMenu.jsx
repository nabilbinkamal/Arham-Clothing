import React from 'react';
import { Link } from 'react-router-dom';
import { productPath } from '../utils/productUrl';

const MegaMenu = ({ category, isVisible, onMouseEnter, onMouseLeave }) => {
  if (!category || !isVisible) return null;

  return (
    <div 
      className={`mega-menu-wrapper ${isVisible ? 'open' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mega-menu-inner">
        {/* Sidebar: Subcategories */}
        <div className="mega-menu-sidebar">
          <h4 className="mega-menu-heading">CATEGORIES</h4>
          <ul className="mega-menu-subcategories">
            {category.subcategories && category.subcategories.map(sub => (
              <li key={sub.id}>
                <Link to={`/shop?cat=${category.slug}&sub=${sub.slug}`}>{sub.name}</Link>
              </li>
            ))}
          </ul>
          <Link to={`/shop?cat=${category.slug}`} className="mega-menu-view-all">
            View All {category.name} →
          </Link>
        </div>

        {/* Content: Recent Products */}
        <div className="mega-menu-content">
          <h4 className="mega-menu-heading">NEW ARRIVALS</h4>
          <div className="mega-menu-products">
            {category.recentProducts && category.recentProducts.length > 0 ? (
              category.recentProducts.map(product => (
                <Link to={productPath(product)} key={product.id} className="mega-product-card">
                  <div className="mega-product-img">
                    <img src={product.imageUrl} alt={product.title} />
                  </div>
                  <div className="mega-product-info">
                    <p className="mega-product-title">{product.title}</p>
                    <p className="mega-product-price">৳{product.price}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '20px', color: '#888', fontSize: '13px' }}>No recent products found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
