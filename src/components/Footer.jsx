import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const [settings, setSettings] = useState({
    social_fb: '#',
    social_ig: '#',
    social_tt: '#',
    social_yt: '#',
    social_x: '#',
    support_phone: '+8809677666888',
    support_days: 'Saturday – Thursday',
    support_hours: '9:00 AM – 10:00 PM'
  });

  useEffect(() => {
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(err => console.error(err));
  }, []);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ loading: false, message: '', type: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSubscribeStatus({ loading: false, message: 'Please enter your email address.', type: 'error' });
      return;
    }
    
    setSubscribeStatus({ loading: true, message: '', type: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribeStatus({ loading: false, message: 'Thanks for subscribing!', type: 'success' });
        setEmail('');
        setTimeout(() => setSubscribeStatus({ loading: false, message: '', type: '' }), 4000);
      } else {
        setSubscribeStatus({ loading: false, message: data.message || 'Subscription failed.', type: 'error' });
      }
    } catch {
      setSubscribeStatus({ loading: false, message: 'Network error. Try again.', type: 'error' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-affiliate">
        <h3>ELEVATE YOUR STYLE — PREMIUM APPAREL</h3>
        <p>CRAFTED FOR COMFORT & DURABILITY — DISCOVER THE LATEST TRENDS</p>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container newsletter-inner">
          <div className="newsletter-text">
            <h3>STAY IN THE LOOP</h3>
            <p>Subscribe to get exclusive deals, new arrivals & style updates.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe} noValidate>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              aria-label="Email address for newsletter subscription"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus.loading}
              required
            />
            <button type="submit" disabled={subscribeStatus.loading}>
              {subscribeStatus.loading ? '...' : 'SUBSCRIBE'}
            </button>
            {subscribeStatus.message && (
              <div role="status" aria-live="polite" style={{ flexBasis: '100%', marginTop: '10px', fontSize: '13px', color: subscribeStatus.type === 'error' ? '#c62828' : '#2e7d32' }}>
                {subscribeStatus.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main footer links */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Logo color="#fff" size={24} />
            <span className="tagline">
              Premium fashion designed for comfort and style.
              Made for Bangladesh, built for the world.
            </span>
            <div className="social-links" style={{ marginTop: 20 }}>
              {settings.social_fb && settings.social_fb !== '#' && <a href={settings.social_fb} target="_blank" rel="noreferrer" className="social-link">FB</a>}
              {settings.social_ig && settings.social_ig !== '#' && <a href={settings.social_ig} target="_blank" rel="noreferrer" className="social-link">IG</a>}
              {settings.social_tt && settings.social_tt !== '#' && <a href={settings.social_tt} target="_blank" rel="noreferrer" className="social-link">TT</a>}
              {settings.social_yt && settings.social_yt !== '#' && <a href={settings.social_yt} target="_blank" rel="noreferrer" className="social-link">YT</a>}
              {settings.social_x && settings.social_x !== '#' && <a href={settings.social_x} target="_blank" rel="noreferrer" className="social-link">X</a>}
            </div>
          </div>

          {/* Links */}
          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Policies</h4>
            <ul>
              <li><Link to="/terms-of-service">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col footer-contact">
            <h4>Customer Care</h4>
            <span className="phone">{settings.support_phone}</span>
            <span className="hours">{settings.support_days}<br />{settings.support_hours}</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} AUREON. All rights reserved.</p>
          <p>Payment: Cash on Delivery (COD)</p>
        </div>
        <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#888' }}>
          Developed by <a href="https://dev.unitedbangla.top" target="_blank" rel="noreferrer" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 'bold' }}>Towhid</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
