import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { WishlistContext } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);

  return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', padding: '60px 20px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Your Wishlist</h1>
          <p style={{ color: '#666', textAlign: 'center', marginBottom: '40px' }}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>

          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
              <Heart size={48} color="#ccc" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Your wishlist is empty</h2>
              <p style={{ color: '#888', marginBottom: '24px' }}>Save items you love here to easily find them later.</p>
              <Link to="/shop" style={{ display: 'inline-block', background: '#111', color: 'white', padding: '12px 32px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {wishlist.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
