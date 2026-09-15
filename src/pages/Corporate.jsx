import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Corporate = () => {
  return (
    <>
      <Header />
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '2px' }}>CORPORATE ORDERS</h1>
        <p style={{ color: '#666', maxWidth: '600px', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
          Elevate your corporate gifting and team apparel with AUREON. We offer bulk purchasing options, custom branding, and premium quality garments tailored for your organization.
        </p>
        <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea', display: 'inline-block' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase' }}>For Corporate Inquiries</p>
          <a href="mailto:corporate@aureonbd.com" style={{ fontSize: '18px', color: '#111', textDecoration: 'underline', fontWeight: '600' }}>corporate@aureonbd.com</a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Corporate;
