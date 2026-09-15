import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [page, setPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/blog')
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
        <h1 className="page-title">{page.title || 'THE AUREON BLOG'}</h1>
        <div 
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>

      <div className="blog-coming-soon">
        <h2>Coming Soon</h2>
        <p>
          We're currently working on exciting content for you. Check back later for fashion tips, new arrival highlights, and much more!
        </p>
        <Link to="/shop" className="form-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          BROWSE SHOP
        </Link>
      </div>
    </div>
  );
};

export default Blog;
