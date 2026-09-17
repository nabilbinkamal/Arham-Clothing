import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Permanent sub-category structure per main category
const SUB_CATEGORIES = {
  men: ['Tops', 'Bottoms', 'Winter'],
  women: ['Tops', 'Bottoms', 'Winter'],
  kids: ['Boys', 'Girls']
};

const MegaMenu = ({ category, isVisible, onMouseEnter, onMouseLeave }) => {
  const [menuData, setMenuData] = useState({});

  useEffect(() => {
    fetch('/api/menu-structure')
      .then(r => r.json())
      .then(data => setMenuData(data))
      .catch(() => {});
  }, []);

  if (!category || !isVisible) return null;

  const slug = category.slug?.toLowerCase();
  const subCats = SUB_CATEGORIES[slug];

  if (!subCats) {
    return (
      <div
        className={`mega-menu-wrapper ${isVisible ? 'open' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="container mega-menu-inner">
          <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
            <Link to={`/shop?cat=${slug}`} className="arham-outline-button">View All {category.name}</Link>
          </div>
        </div>
      </div>
    );
  }

  const catData = menuData[slug] || {};

  return (
    <div
      className={`mega-menu-wrapper ${isVisible ? 'open' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mega-menu-inner">
        <div className="mega-menu-grid">
          {subCats.map((subCat) => {
            const items = catData[subCat.toLowerCase()] || [];
            return (
              <div key={subCat} className="mega-menu-column">
                <h4 className="mega-menu-heading">{subCat.toUpperCase()}</h4>
                <ul className="mega-menu-links">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link to={`/shop?cat=${slug}&type=${item.slug}`}>{item.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link to={`/shop?cat=${slug}`}>All</Link>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
