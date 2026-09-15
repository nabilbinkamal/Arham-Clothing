import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCat = searchParams.get('cat') || '';
  const selectedSub = searchParams.get('subcat') || '';
  const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();
  const customTitle = searchParams.get('title') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, subRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/subcategories')
        ]);
        setProducts(await prodRes.json());
        setCategories(await catRes.json());
        setSubcategories(await subRes.json());
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch shop data', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCatChange = (catSlug) => {
    if (catSlug === selectedCat) {
      searchParams.delete('cat');
      searchParams.delete('subcat');
    } else {
      searchParams.set('cat', catSlug);
      searchParams.delete('subcat');
    }
    setSearchParams(searchParams);
  };

  const handleSubChange = (subSlug) => {
    if (subSlug === selectedSub) {
      searchParams.delete('subcat');
    } else {
      searchParams.set('subcat', subSlug);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter(p => {
    if (selectedCat && p.category !== selectedCat && p.category?.toLowerCase() !== selectedCat.toLowerCase()) return false;
    if (selectedSub && p.subcategory !== selectedSub) return false;
    if (searchQuery) {
      const haystack = [p.title, p.category, p.subcategory, p.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }
    return true;
  });

  return (
    <>
      <Header cartCount={0} />
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center', textTransform: 'uppercase' }}>
          {customTitle || (searchQuery ? `Search: ${searchParams.get('search')}` : selectedCat ? selectedCat : 'Shop Our Collection')}
        </h1>
        
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className="shop-sidebar">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #111', paddingBottom: '8px', marginBottom: '16px' }}>Categories</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {categories.map(c => (
                  <li key={c.id} style={{ marginBottom: '8px' }}>
                    <button 
                      onClick={() => handleCatChange(c.slug)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '15px',
                        fontWeight: selectedCat === c.slug ? 'bold' : 'normal',
                        color: selectedCat === c.slug ? '#111' : '#555',
                        padding: '4px 0',
                        textAlign: 'left',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{c.name}</span>
                      {selectedCat === c.slug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {/* Subcategories if category is selected */}
                    {selectedCat === c.slug && (
                      <ul style={{ listStyle: 'none', paddingLeft: '16px', marginTop: '8px' }}>
                        {subcategories.filter(s => s.category_id === c.id).map(s => (
                          <li key={s.id} style={{ marginBottom: '4px' }}>
                            <button
                              onClick={() => handleSubChange(s.slug)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '14px',
                                fontWeight: selectedSub === s.slug ? '600' : 'normal',
                                color: selectedSub === s.slug ? '#111' : '#777',
                                textAlign: 'left',
                                width: '100%'
                              }}
                            >
                              - {s.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="shop-products">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No products found for this search/filter.</div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                gap: '24px' 
              }}>
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Shop;
