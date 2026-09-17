import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Leaf, Shirt, Truck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';

const sampleProducts = [
  { id: 'arham-essential-white', title: 'Essential Tee', price: 1350, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85', category: 't-shirts', colors: ['#fff', '#222'] },
  { id: 'arham-signature-black', title: 'Signature Tee', price: 1450, imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=85', category: 't-shirts', colors: ['#222', '#888', '#fff'] },
  { id: 'arham-classic-olive', title: 'Classic Tee', price: 1350, imageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=700&q=85', category: 't-shirts', colors: ['#4b5320', '#888', '#222'] },
  { id: 'arham-raglan', title: 'Raglan Tee', price: 1550, imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=700&q=85', category: 't-shirts', colors: ['#0f172a', '#fff'] }
];

const Home = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch('/api/products').then(response => response.json()).then(data => {
      if (Array.isArray(data) && data.length) setProducts(data);
    }).catch(() => {});
    fetch('/api/features').then(response => response.json()).then(data => {
      if (Array.isArray(data)) setFeatures(data.filter(feature => feature.is_active));
    }).catch(() => {});
  }, []);

  const newest = [...products].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);
  const featureItems = features.length ? features.slice(0, 4).map(item => ({ title: item.title, description: item.description, icon: BadgeCheck })) : [
    { title: 'Premium Fabric', description: 'Soft, breathable, long lasting.', icon: Leaf },
    { title: 'Comfortable Fit', description: 'Made for all-day ease.', icon: Shirt },
    { title: 'Quality Craftsmanship', description: 'Attention in every stitch.', icon: BadgeCheck },
    { title: 'Wholesale Available', description: 'For your growing business.', icon: Truck }
  ];

  return <>
    <Header />
    <main className="arham-home">
      <HeroBanner />
      <section className="arham-collection">
        <div className="arham-collection-intro">
          <div className="eyebrow">NEW COLLECTION</div>
          <h2>Volume 01 &mdash;<br />Everyday&nbsp;Essentials</h2>
          <p>Minimal design. Premium comfort.</p>
          <Link to="/shop?sort=newest" className="arham-button">SHOP NOW <ArrowRight size={16} /></Link>
        </div>
        <div className="arham-products-grid">
          {(newest.length ? newest : sampleProducts).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="arham-story">
        <div className="arham-story-image arham-story-detail" />
        <div className="arham-story-copy"><span className="eyebrow">ABOUT ARHAM</span><h2>ARHAM</h2><h3>Less noise. More character.</h3><p>We create timeless everyday pieces built around simplicity, comfort and modern style.</p><Link to="/about" className="arham-outline-button">ABOUT <ArrowRight size={16} /></Link></div>
        <div className="arham-story-image arham-story-model" />
      </section>
      <section className="arham-values"><span className="eyebrow">WHY ARHAM</span><div className="arham-values-grid">{featureItems.map(({ title, description, icon: Icon }) => <div className="arham-value" key={title}><Icon size={27} strokeWidth={1.5} /><h3>{title}</h3><p>{description}</p></div>)}</div></section>
    </main>
    <Footer />
  </>;
};

export default Home;
