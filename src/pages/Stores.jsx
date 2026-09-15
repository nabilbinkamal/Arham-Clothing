import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Stores = () => {
  return (
    <>
      <Header />
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '2px' }}>OUR STORES</h1>
        <p style={{ color: '#666', maxWidth: '600px', fontSize: '16px', lineHeight: '1.6' }}>
          We are currently operating exclusively online to bring you the best prices and nationwide delivery. 
          Physical flagship stores in Dhaka are coming soon! Stay tuned to our social media for updates.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Stores;
