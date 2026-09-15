import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import * as LucideIcons from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from backend
    // In production, Nginx proxies /api to the backend. In dev, Vite proxies it.
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch active features
    fetch('/api/features')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatures(data.filter(f => f.is_active));
        }
      })
      .catch(err => console.error(err));

    // Fetch homepage sections
    fetch('/api/homepage-sections')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSections(data.filter(s => s.is_active));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const menProducts = products.filter(p => {
    const cat = p.category?.toLowerCase() || '';
    return cat === 'men' || cat === 'mens' || cat === 'mens-collection' || (cat.includes('men') && !cat.includes('women'));
  });
  const womenProducts = products.filter(p => {
    const cat = p.category?.toLowerCase() || '';
    return cat === 'women' || cat === 'womens' || cat === 'womens-collection' || cat.includes('women');
  });
  const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 8); // top 8 newest products

  const renderSection = (section) => {
    switch (section.section_key) {
      case 'new_arrivals':
        return (
          <CategoryGrid
            key={section.id}
            title={section.title}
            bannerImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            bannerLink={`/shop?sort=newest&title=${encodeURIComponent(section.title)}`}
            products={newArrivals}
            isBento={true}
          />
        );
      case 'mens':
        return (
          <CategoryGrid
            key={section.id}
            title={section.title}
            bannerImage="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            bannerLink={`/shop?cat=men&title=${encodeURIComponent(section.title)}`}
            products={menProducts}
          />
        );
      case 'womens':
        return (
          <CategoryGrid
            key={section.id}
            title={section.title}
            bannerImage="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            bannerLink={`/shop?cat=women&title=${encodeURIComponent(section.title)}`}
            products={womenProducts}
          />
        );
      case 'features':
        if (features.length === 0) return null;
        return (
          <section key={section.id} style={{ padding: '60px 20px', background: '#fafafa', borderTop: '1px solid #eee' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px', fontWeight: 'bold' }}>{section.title}</h2>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', textAlign: 'center' }}>
              {features.map(f => {
                const IconComponent = LucideIcons[f.icon] || LucideIcons.Star;
                return (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <IconComponent size={30} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{f.title}</h3>
                    <p style={{ color: '#666', lineHeight: '1.5', fontSize: '14px' }}>{f.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header cartCount={0} />
      <main>
        <HeroBanner />

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <>
            {sections.map(section => renderSection(section))}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Home;
