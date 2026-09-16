import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, Truck, Building2, Info, LogOut } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { UserContext } from '../context/UserContext';
import { ToastContext } from '../context/ToastContext';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import MegaMenu from './MegaMenu';

const Header = () => {
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const { cartCount, setIsCartOpen } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user, login, logout } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([cats, subs, products]) => {
      setDbCategories(Array.isArray(cats) ? cats : []);
      setDbSubcategories(Array.isArray(subs) ? subs : []);
      setDbProducts(Array.isArray(products) ? products : []);
    }).catch(() => {});
  }, []);

  const location = useLocation();
  const navigation = dbCategories.length
    ? [{ id: 'home', name: 'Home', slug: 'home' }, ...dbCategories.filter(c => c.slug !== 'home')]
    : [{ id: 'home', name: 'Home', slug: 'home' }, { id: 'kids', name: 'Kids', slug: 'kids' }, { id: 'men', name: 'Men', slug: 'men' }, { id: 'women', name: 'Women', slug: 'women' }];
  const showMegaMenu = category => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const subcategories = dbSubcategories.filter(item => item.category_id === category.id);
    const recentProducts = dbProducts.filter(item => item.category?.toLowerCase() === category.slug?.toLowerCase()).slice(0, 4);
    setHoveredCategory({ ...category, subcategories, recentProducts });
  };
  const closeMegaMenu = () => { hoverTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 180); };
  const submitSearch = event => {
    event.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal('');
    setSearchOpen(false);
  };
  const handleProfile = async () => {
    if (user) return navigate('/profile');
    const result = await login();
    if (result?.success) addToast('Successfully signed in!', 'success');
    else if (!result?.cancelled) addToast(result?.message || 'Login failed', 'error');
  };
  const mobileCategories = navigation.map(item => ({ label: item.name.toUpperCase(), href: item.slug === 'home' ? '/' : `/shop?cat=${item.slug}` }));

  const isActive = (item) => {
    if (item.slug === 'home') return location.pathname === '/';
    return location.pathname === '/shop' && location.search.includes(`cat=${item.slug}`);
  };

  return <>
    <header className="arham-header" onMouseLeave={closeMegaMenu}>
      <div className="arham-header-inner">
        <button className="arham-menu-button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        <Link to="/" className="arham-logo-link" aria-label="Arham Clothing home"><Logo size={25} /></Link>
        <nav className="arham-nav" aria-label="Main navigation">
          {navigation.map(item => <Link key={item.id} to={item.slug === 'home' ? '/' : `/shop?cat=${item.slug}`} className={isActive(item) ? 'active' : ''} onMouseEnter={() => item.slug !== 'home' ? showMegaMenu(item) : null}>{item.name}</Link>)}
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
        </nav>
        <div className="arham-header-actions">
          <button className="arham-icon-button" onClick={() => setSearchOpen(open => !open)} aria-label="Search"><Search size={20} /></button>
          <div className="profile-dropdown-wrap">
            <button className="arham-icon-button arham-profile-button" onClick={() => { if(user) navigate('/profile'); }} aria-label={user ? 'Your profile' : 'Sign in'}>
              <User size={20} />
            </button>
            <div className="profile-dropdown">
              <div style={{ padding: '0 24px 10px' }}>
                <p style={{ color: '#ff3366', fontWeight: 'bold', margin: '0 0 8px', fontSize: '14px' }}>Welcome{user ? `, ${user.name?.split(' ')[0]}` : ''}</p>
                {!user ? (
                  <button onClick={handleProfile} style={{ color: '#ff3366', fontWeight: 'bold', fontSize: '14px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Sign in / Sign up</button>
                ) : (
                  <button onClick={() => navigate('/profile')} style={{ color: '#ff3366', fontWeight: 'bold', fontSize: '14px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>My Account</button>
                )}
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/track-order" className="dropdown-item">
                <Truck size={18} />
                <span>Track Order</span>
              </Link>
              <Link to="/corporate-sales" className="dropdown-item">
                <Building2 size={18} />
                <span>Corporate Sales</span>
              </Link>
              <Link to="/about" className="dropdown-item">
                <Info size={18} />
                <span>About Us</span>
              </Link>
              {user && (
                <>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { logout(); navigate('/'); }} className="dropdown-item" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <Link to="/wishlist" className="arham-icon-button" aria-label="Wishlist"><Heart size={20} />{wishlist?.length > 0 && <b>{wishlist.length}</b>}</Link>
          <button className="arham-icon-button" onClick={() => setIsCartOpen(true)} aria-label="Shopping bag"><ShoppingBag size={20} />{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </div>
      <form className={`arham-search ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch} role="search">
        <Search size={17} /><input autoFocus={searchOpen} value={searchVal} onChange={event => setSearchVal(event.target.value)} placeholder="Search the collection" aria-label="Search products" />
        <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
      </form>
      <MegaMenu category={hoveredCategory} isVisible={Boolean(hoveredCategory)} onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)} onMouseLeave={closeMegaMenu} />
    </header>
    <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} categories={mobileCategories} />
  </>;
};

export default Header;
