import React, { useState, useEffect } from 'react';

const About = () => {
  const [page, setPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/about')
      .then(res => res.json())
      .then(data => {
        setPage(data);
        setPageLoading(false);
      })
      .catch(() => {
        setPageLoading(false);
      });
  }, []);

  if (pageLoading) {
    return <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!page || page.error) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#111' }}>PAGE UNAVAILABLE</h1>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>This page is currently disabled.</p>
          <a href="/" style={{ display: 'inline-block', background: '#111', color: 'white', padding: '12px 32px', textDecoration: 'none', fontWeight: '700', borderRadius: '4px' }}>RETURN TO HOMEPAGE</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">{page.title || 'OUR STORY'}</h1>
        <div 
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
      
      <div className="about-content">
        <div className="about-text">
          <p>
            Our journey started with a simple idea: to create minimalist, high-quality apparel that empowers individuals to look and feel their best. We obsess over the details—from selecting the finest fabrics to perfecting the fit of every garment.
          </p>
          <p>
            To redefine modern fashion through timeless designs, sustainable practices, and an unwavering commitment to craftsmanship. We are not just making clothes; we are building a lifestyle of confidence and elegance.
          </p>
        </div>

        <div className="about-highlight">
          <h3>ELEVATE YOUR STYLE</h3>
          <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>
            Discover the latest trends and experience apparel crafted for durability and comfort.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
