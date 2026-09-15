import React, { useEffect, useState } from 'react';

const Contact = () => {
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });
  const [page, setPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('publicSettings') || '{}');
      setSettings(stored);
    } catch {}

    setPageLoading(true);
    fetch('/api/pages/contact')
      .then(res => res.json())
      .then(data => {
        setPage(data);
        setPageLoading(false);
      })
      .catch(() => {
        setPageLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ loading: false, success: true, error: '' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ loading: false, success: false, error: data.message });
      }
    } catch {
      setStatus({ loading: false, success: false, error: 'Network error. Please try again.' });
    }
  };

  if (pageLoading) {
    return <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!page || page.error) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#111' }}>PAGE UNAVAILABLE</h1>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>The contact page is currently disabled.</p>
          <a href="/" style={{ display: 'inline-block', background: '#111', color: 'white', padding: '12px 32px', textDecoration: 'none', fontWeight: '700', borderRadius: '4px' }}>RETURN TO HOMEPAGE</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">{page.title || 'CONTACT US'}</h1>
        <div 
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <h3>HOTLINE</h3>
          <p className="value">{settings.hotline || '+8809677666888'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Sat - Thu, 9:00 AM - 10:00 PM</p>
        </div>
        
        <div className="contact-card">
          <h3>WHATSAPP</h3>
          <p className="value">{settings.whatsapp_number || '+8801234567890'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Quick replies for order updates</p>
        </div>

        <div className="contact-card">
          <h3>EMAIL</h3>
          <p className="value" style={{ fontSize: '16px' }}>{settings.contact_email || 'support@aureonbd.com'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>For general inquiries and support</p>
        </div>
      </div>
      
      <div className="contact-form-wrapper">
        <h3 style={{ fontSize: '20px', marginBottom: '24px', letterSpacing: '1px' }}>SEND A MESSAGE</h3>
        
        {status.success && (
          <div style={{ padding: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '20px', fontWeight: '600' }}>
            Thank you! Your message has been sent successfully. We will get back to you soon.
          </div>
        )}
        {status.error && (
          <div style={{ padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px', fontWeight: '600' }}>
            {status.error}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-input" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={status.loading} />
            <input type="email" className="form-input" placeholder="Your Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={status.loading} />
          </div>
          <input type="text" className="form-input" placeholder="Subject" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} disabled={status.loading} />
          <textarea className="form-input" placeholder="Your Message" rows="5" style={{ resize: 'vertical' }} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} disabled={status.loading}></textarea>
          <button type="submit" className="form-btn" disabled={status.loading} style={{ opacity: status.loading ? 0.7 : 1 }}>
            {status.loading ? 'SENDING...' : 'SUBMIT MESSAGE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
