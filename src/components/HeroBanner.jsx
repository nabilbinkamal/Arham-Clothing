import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

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

  const total = Math.max(sliders.length, 1);
  const slideLink = currentSlider?.link_url || '/shop?sort=newest';
  const next = () => setCurrentIndex(index => (index + 1) % total);
  const previous = () => setCurrentIndex(index => (index - 1 + total) % total);

  return (
    <section className="arham-hero">
      <img
        className="arham-hero-image"
        src={currentSlider?.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=90'}
        alt="Arham Clothing new collection"
        fetchPriority="high"
      />
      <div className="arham-hero-shade" />
      <div className="arham-hero-copy">
        <span className="eyebrow">FOR A BETTER EVERYDAY</span>
        <h1>THE NEW<br />STANDARD</h1>
        <p>Refined essentials. Designed for everyday.</p>
        <Link to={slideLink} className="arham-button">SHOP COLLECTION <ArrowRight size={16} /></Link>
      </div>
      <div className="arham-slider-controls" aria-label="Hero slider controls">
        <span className="arham-slide-count">{String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button onClick={previous} aria-label="Previous slide"><ArrowLeft size={17} /></button>
        <button onClick={next} aria-label="Next slide"><ArrowRight size={17} /></button>
      </div>
      {settings.promo_bar_active !== '0' && <p className="arham-hero-note">{settings.promo_bar_text || 'New season, made to live in.'}</p>}
    </section>
  );
};

export default HeroBanner;
