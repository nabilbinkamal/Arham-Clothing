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
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#111' }}>PAGE UNAVAILABLE</h1>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>The page you are looking for is currently disabled or does not exist. Please check back later or contact support if you need immediate assistance.</p>
            <a href="/" style={{ display: 'inline-block', background: '#111', color: 'white', padding: '12px 32px', textDecoration: 'none', fontWeight: '700', borderRadius: '4px' }}>RETURN TO HOMEPAGE</a>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CustomPage;
