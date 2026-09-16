import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Careers = () => {
  return (
    <>
      <Header />
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '2px' }}>CAREERS AT ARHAM</h1>
        <p style={{ color: '#666', maxWidth: '600px', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
          We are always on the lookout for passionate, creative, and driven individuals to join our growing team. 
          Currently, we do not have any open positions, but we'd love to keep your resume on file for future opportunities.
        </p>
        <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea', display: 'inline-block' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase' }}>Drop Your Resume At</p>
          <a href="mailto:careers@arhamclothing.com" style={{ fontSize: '18px', color: '#111', textDecoration: 'underline', fontWeight: '600' }}>careers@arhamclothing.com</a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Careers;
