import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

const CategoryGrid = ({ title, bannerLink, products, isBento = false }) => {
  return (
    <section className="category-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to={bannerLink} className="view-all-link">
            VIEW ALL <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Layout */}
        <div className="category-layout">
          {/* Products Grid */}
          <div className={`products-grid ${isBento ? 'bento-grid' : ''}`}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}

            {/* View More */}
            <Link to={bannerLink} className="view-more-card">
              <span>+</span>
              <span>VIEW MORE</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
