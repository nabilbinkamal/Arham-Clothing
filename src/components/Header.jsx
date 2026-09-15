import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, MapPin, Truck, Building, Info } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { UserContext } from '../context/UserContext';
import { ToastContext } from '../context/ToastContext';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import MegaMenu from './MegaMenu';

const Header = () => {
  const [searchVal, setSearchVal] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user, login } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const [settings, setSettings] = useState({});
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('publicSettings') || '{}');
      setSettings(stored);
    } catch{}

    // Fetch dynamic categories
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([cats, subs, prods]) => {
      setDbCategories(Array.isArray(cats) ? cats : []);
      setDbSubcategories(Array.isArray(subs) ? subs : []);
      setDbProducts(Array.isArray(prods) ? prods : []);
    }).catch(err => console.error("Error fetching mega menu data:", err));
  }, []);

  const handleMouseEnter = (cat) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const subs = dbSubcategories.filter(s => s.category_id === cat.id);
    const catProducts = dbProducts.filter(p => {
       const pCat = p.category?.toLowerCase() || '';
       const cSlug = cat.slug.toLowerCase();
       return pCat === cSlug || pCat === cSlug + 's' || pCat + 's' === cSlug;
    }).slice(0, 4);
    setHoveredCategory({ ...cat, subcategories: subs, recentProducts: catProducts });
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleLoginClick = async () => {
    if (user) {
      // If already logged in, no-op here since it's a Link
    } else {
      const res = await login();
      if (res.success) {
        addToast('Successfully signed in!', 'success');
      } else if (!res.cancelled) {
        addToast(res.message || 'Login failed', 'error');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchVal.trim();
    if (!query) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchVal('');
  };

  const mobileCategories = dbCategories.length > 0 
    ? dbCategories.map(c => ({ label: c.name, href: `/shop?cat=${c.slug}` }))
    : [
      { label: 'MEN', href: '/shop?cat=men' },
      { label: 'WOMEN', href: '/shop?cat=women' },
      { label: 'KIDS', href: '/shop?cat=kids' },
      { label: 'ACCESSORIES', href: '/shop?cat=accessories' },
    ];

  return (
    <>
      {/* Announcement bar */}
      {settings.top_bar_active !== '0' && (
        <div className="announcement-bar" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span>{settings.top_bar_text || 'NATIONWIDE CASH ON DELIVERY AVAILABLE'}</span>
        </div>
      )}

      <header className="header" onMouseLeave={handleMouseLeave}>
        <div className="container header-inner">
          
          {/* Hamburger Menu (Desktop & Mobile) */}
          <button className="icon-btn" style={{ marginRight: '16px' }} onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="logo-link" style={{ textDecoration: 'none' }}>
            <Logo color="var(--primary)" size={28} />
          </Link>

          {/* Nav (Desktop Only) */}
          <nav className="main-nav desktop-nav">
            <ul style={{ display: 'flex', gap: '36px', height: '100%', alignItems: 'center' }}>
              {dbCategories.length > 0 ? (
                dbCategories.map(c => (
                  <li 
                    key={c.id} 
                    style={{ height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => handleMouseEnter(c)}
                  >
                    <Link to={`/shop?cat=${c.slug}`} style={{ padding: '24px 0', borderBottom: hoveredCategory?.id === c.id ? '2px solid var(--primary)' : '2px solid transparent' }}>
                      {c.name}
                    </Link>
                  </li>
                ))
              ) : (
                mobileCategories.map(c => (
                  <li key={c.label}>
                    <Link to={c.href}>{c.label}</Link>
                  </li>
                ))
              )}
            </ul>
          </nav>

          {/* Right: search + icons */}
          <div className="header-right">
            <form className="search-box desktop-search" onSubmit={handleSearch} role="search">
              <Search size={18} strokeWidth={2} color="#aaa" />
              <input
                type="text"
                placeholder="Search"
                aria-label="Search products"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
            </form>

            <Link to="/stores" className="header-action-item">
              <MapPin size={22} strokeWidth={1.5} />
              <span>Stores</span>
            </Link>

            <div 
              className="profile-dropdown-wrap header-action-item"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  if (user) {
                    navigate('/profile');
                  } else {
                    handleLoginClick();
                  }
                }
              }}
            >
              {user ? (
                <>
                  <User size={22} strokeWidth={1.5} color="#ff3366" />
                  <span style={{ color: '#ff3366' }}>Profile</span>
                </>
              ) : (
                <>
                  <User size={22} strokeWidth={1.5} color="#ff3366" />
                  <span style={{ color: '#ff3366' }}>Profile</span>
                </>
              )}
              
              <div className="profile-dropdown">
                <div style={{ padding: '0 24px', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Welcome</div>
                {user ? (
                  <Link to="/profile" className="dropdown-item" style={{ color: '#ff3366', fontWeight: 'bold' }}>
                    View Profile
                  </Link>
                ) : (
                  <button onClick={handleLoginClick} className="dropdown-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: '#ff3366', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}>
                    Sign in / Sign up
                  </button>
                )}
                <div className="dropdown-divider"></div>
                <Link to="/track-order" className="dropdown-item">
                  <Truck size={16} /> Track Order
                </Link>
                <Link to="/corporate" className="dropdown-item">
                  <Building size={16} /> Corporate Sales
                </Link>
                <Link to="/about" className="dropdown-item">
                  <Info size={16} /> About Us
                </Link>
              </div>
            </div>

            <Link to="/wishlist" className="header-action-item">
              <Heart size={22} strokeWidth={1.5} />
              <span>Wishlist</span>
              {wishlist && wishlist.length > 0 && <span className="cart-badge" style={{ backgroundColor: '#111' }}>{wishlist.length}</span>}
            </Link>

            <button className="header-action-item" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span>Bag</span>
              {cartCount > 0 && <span className="cart-badge" style={{ backgroundColor: '#ff3366' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
        
        {/* Mega Menu Dropdown */}
        <MegaMenu 
          category={hoveredCategory} 
          isVisible={!!hoveredCategory} 
          onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        />
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        categories={mobileCategories} 
      />
    </>
  );
};

export default Header;
