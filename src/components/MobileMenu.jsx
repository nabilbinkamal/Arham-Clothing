import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import Logo from './Logo';
import { UserContext } from '../context/UserContext';
import { ToastContext } from '../context/ToastContext';

const MobileMenu = ({ isOpen, onClose, categories }) => {
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const { user, login, logout } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogin = async () => {
    onClose();
    const res = await login();
    if (res.success) {
      addToast('Successfully signed in!', 'success');
    } else if (!res.cancelled) {
      addToast(res.message || 'Login failed', 'error');
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
    addToast('Successfully signed out!', 'success');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(searchVal)}`);
      setSearchVal('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`mobile-menu-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <Logo color="var(--primary)" size={24} />
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <form onSubmit={handleSearch} style={{ padding: '0 24px 20px', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#111', color: 'white', padding: '0 14px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={18} />
            </button>
          </form>
          <ul>
            <li onClick={onClose}><Link to="/">HOME</Link></li>
            <li onClick={onClose}><Link to="/shop">ALL PRODUCTS</Link></li>
            {categories.map(c => (
              <li key={c.label} onClick={onClose}>
                <Link to={c.href}>{c.label}</Link>
              </li>
            ))}
          </ul>
          
          <div style={{ marginTop: '20px', borderTop: '4px solid #f5f5f5' }}>
            <ul>
              {user ? (
                <>
                  <li onClick={onClose}><Link to="/profile" style={{ color: '#ff3366' }}>MY PROFILE</Link></li>
                  <li onClick={onClose}><Link to="/track-order">TRACK ORDER</Link></li>
                  <li onClick={handleLogout}><span className="menu-action" style={{ color: '#666', cursor: 'pointer' }}>LOGOUT</span></li>
                </>
              ) : (
                <>
                  <li onClick={handleLogin}><span className="menu-action" style={{ color: '#ff3366', cursor: 'pointer' }}>SIGN IN / SIGN UP</span></li>
                  <li onClick={onClose}><Link to="/track-order">TRACK ORDER</Link></li>
                </>
              )}
            </ul>
          </div>
        </nav>

        <div className="mobile-menu-footer">
          <p>© 2026 ARHAM CLOTHING. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
