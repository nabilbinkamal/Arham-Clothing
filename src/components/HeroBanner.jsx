import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroBanner = () => {
  const [sliders, setSliders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('publicSettings') || '{}');
      setSettings(stored);
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/api/sliders?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        const activeSliders = data.filter(s => s.is_active);
        setSliders(activeSliders);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders]);

  const currentSlider = sliders.length > 0 ? sliders[currentIndex] : null;

  return (
    <section className="hero-section">
      {/* Main Hero */}
      <div className="hero-slider">
        <div className="hero-slide">
          {/* Background image */}
          <img
            src={currentSlider ? currentSlider.image_url : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"}
            alt="Hero"
            fetchPriority="high"
            style={{ transition: 'opacity 1s ease-in-out' }}
          />

          <div className="hero-content">
            <span className="hero-tag">LIMITED EDITION</span>
            <h1 className="hero-title">Defined by Simplicity.</h1>
            <p className="hero-subtitle">
              FIND Your Choice
            </p>
            {currentSlider?.link_url ? (
              <Link to={currentSlider.link_url} className="hero-cta">
                SHOP NOW <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            ) : (
              <Link to="/shop" className="hero-cta">
                SHOP NOW <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>
        
        {/* Slider Dots Indicator */}
        {sliders.length > 1 && (
          <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
            {sliders.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', background: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, transition: 'background 0.3s' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Promo bar */}
      <div className="promo-bar">
        <div className="promo-inner">
          <div className="promo-links">
            <Link to="/shop" className="promo-link">SHOP NOW</Link>
            <Link to="/shop?cat=men" className="promo-link">MEN</Link>
            <Link to="/shop?cat=women" className="promo-link">WOMEN</Link>
            <Link to="/shop?cat=kids" className="promo-link">KIDS</Link>
          </div>
          {settings.promo_bar_active !== '0' && (
            <span className="promo-notice">{settings.promo_bar_text || '🎉 LIMITED OFFER: FREE SHIPPING ON ALL COD ORDERS'}</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
