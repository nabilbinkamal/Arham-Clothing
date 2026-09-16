import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const PolicyPage = ({ policyKey }) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/policies/${policyKey}`)
      .then(res => res.json())
      .then(data => {
        setPolicy(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [policyKey]);

  return (
    <>
      <Header />
      <main style={{ padding: '60px 20px', minHeight: '60vh', background: '#fafafa' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : policy && !policy.error ? (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', borderBottom: '2px solid #111', paddingBottom: '16px' }}>{policy.title}</h1>
              <div 
                className="policy-content"
                style={{ lineHeight: '1.8', color: '#444' }}
                dangerouslySetInnerHTML={{ __html: policy.content }} 
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', fontFamily: '"Playfair Display", serif' }}>Policy Updating</h2>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>We are currently reviewing and updating our policies. Please check back soon.</p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

export default PolicyPage;
