import React from 'react';
import { Link } from 'react-router-dom';

const MENU_DATA = {
  men: [
    {
      title: 'TOPS',
      links: [
        { label: 'Jersey', href: '/shop?cat=men&type=jersey' },
        { label: 'Casual Shirt - Long Sleeve', href: '/shop?cat=men&type=casual-shirt-long' },
        { label: 'Formal Shirt', href: '/shop?cat=men&type=formal-shirt' },
        { label: 'Panjabi', href: '/shop?cat=men&type=panjabi' },
        { label: 'Polo Shirt', href: '/shop?cat=men&type=polo-shirt' },
        { label: 'Casual Shirt - Half Sleeve', href: '/shop?cat=men&type=casual-shirt-half' },
        { label: 'T-Shirt', href: '/shop?cat=men&type=t-shirt' },
        { label: 'Vest', href: '/shop?cat=men&type=vest' },
        { label: 'All', href: '/shop?cat=men' }
      ]
    },
    {
      title: 'BOTTOMS',
      links: [
        { label: 'Five Pocket Pant', href: '/shop?cat=men&type=five-pocket-pant' },
        { label: 'Chino Long Pant', href: '/shop?cat=men&type=chino-long-pant' },
        { label: 'Denim Pant', href: '/shop?cat=men&type=denim-pant' },
        { label: 'Formal Pant', href: '/shop?cat=men&type=formal-pant' },
        { label: 'Joggers', href: '/shop?cat=men&type=joggers' },
        { label: 'Pajama', href: '/shop?cat=men&type=pajama' },
        { label: 'Shorts', href: '/shop?cat=men&type=shorts' },
        { label: 'All', href: '/shop?cat=men' }
      ]
    },
    {
      title: 'WINTER',
      links: [
        { label: 'Sweater T-Shirt', href: '/shop?cat=men&type=sweater-t-shirt' },
        { label: 'Summer Sweater', href: '/shop?cat=men&type=summer-sweater' },
        { label: 'All', href: '/shop?cat=men' }
      ]
    }
  ],
  women: [
    {
      title: 'TOPS',
      links: [
        { label: 'Kurtis', href: '/shop?cat=women&type=kurtis' },
        { label: 'T-Shirt', href: '/shop?cat=women&type=t-shirt' },
        { label: 'Tops', href: '/shop?cat=women&type=tops' },
        { label: 'All', href: '/shop?cat=women' }
      ]
    },
    {
      title: 'BOTTOMS',
      links: [
        { label: 'Denim', href: '/shop?cat=women&type=denim' },
        { label: 'Palazzo', href: '/shop?cat=women&type=palazzo' },
        { label: 'Pajama', href: '/shop?cat=women&type=pajama' },
        { label: 'All', href: '/shop?cat=women' }
      ]
    },
    {
      title: 'WINTER',
      links: [
        { label: 'Sweater', href: '/shop?cat=women&type=sweater' },
        { label: 'Cardigan', href: '/shop?cat=women&type=cardigan' },
        { label: 'All', href: '/shop?cat=women' }
      ]
    }
  ],
  kids: [
    {
      title: 'BOYS',
      links: [
        { label: 'T-Shirts', href: '/shop?cat=kids&type=boys-t-shirts' },
        { label: 'Shirts', href: '/shop?cat=kids&type=boys-shirts' },
        { label: 'Panjabi', href: '/shop?cat=kids&type=boys-panjabi' },
        { label: 'Pants', href: '/shop?cat=kids&type=boys-pants' },
        { label: 'Shorts', href: '/shop?cat=kids&type=boys-shorts' }
      ]
    },
    {
      title: 'GIRLS',
      links: [
        { label: 'Dresses', href: '/shop?cat=kids&type=girls-dresses' },
        { label: 'Tops', href: '/shop?cat=kids&type=girls-tops' },
        { label: 'Bottoms', href: '/shop?cat=kids&type=girls-bottoms' },
        { label: 'Winter', href: '/shop?cat=kids&type=girls-winter' }
      ]
    }
  ]
};

const MegaMenu = ({ category, isVisible, onMouseEnter, onMouseLeave }) => {
  if (!category || !isVisible) return null;

  const data = MENU_DATA[category.slug?.toLowerCase()];

  return (
    <div 
      className={`mega-menu-wrapper ${isVisible ? 'open' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mega-menu-inner">
        {data ? (
          <div className="mega-menu-grid">
            {data.map((col, idx) => (
              <div key={idx} className="mega-menu-column">
                <h4 className="mega-menu-heading">{col.title}</h4>
                <ul className="mega-menu-links">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link to={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
            <Link to={`/shop?cat=${category.slug}`} className="arham-outline-button">View All {category.name}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
