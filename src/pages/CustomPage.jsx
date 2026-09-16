import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CustomPage = ({ pageKey }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages/${pageKey}`)
      .then(res => res.json())
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pageKey]);

  return (
    <>
      <Header />
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
        {loading ? (
          <div>Loading...</div>
        ) : page && !page.error ? (
          <>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>{page.title}</h1>
            <div 
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', padding: '60px 20px' }}>
            <span style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '12px', fontWeight: '500', letterSpacing: '0.28em', marginBottom: '16px' }}>UPDATING SOON</span>
            <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '20px', fontFamily: '"Playfair Display", serif' }}>Check Back Later</h1>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px', marginBottom: '32px' }}>We are currently crafting the content for this page. Please return soon to discover more about Arham Clothing.</p>
            <a href="/shop" className="arham-button" style={{ textDecoration: 'none', display: 'inline-flex' }}>CONTINUE SHOPPING</a>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CustomPage;
