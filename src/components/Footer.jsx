import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMessage('Enter a valid email address.');
    try {
      const response = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      setMessage(data.success ? 'Thank you for subscribing.' : (data.message || 'Please try again.'));
      if (data.success) setEmail('');
    } catch { setMessage('Thank you — we will be in touch.'); }
  };

  return <footer className="arham-footer">
    <div className="arham-footer-main">
      <div className="arham-footer-brand"><Logo size={38} /><span>WEAR LESS. SAY MORE.</span></div>
      <nav className="arham-footer-links" aria-label="Footer navigation"><Link to="/shop">Shop</Link> <span>|</span> <Link to="/about">About</Link> <span>|</span> <Link to="/faq">Shipping & Contact</Link> <span>|</span> <Link to="/contact">Contact</Link></nav>
      <div className="arham-social-links"><a href="#instagram" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a><a href="#facebook" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a><a href="#tiktok" aria-label="TikTok"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a></div>
      <form className="arham-newsletter" onSubmit={submit} noValidate><label htmlFor="newsletter-email">Join our newsletter</label><div><input id="newsletter-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" /><button type="submit" aria-label="Subscribe"><ArrowRight size={20} /></button></div>{message && <small>{message}</small>}</form>
    </div>
    <div className="arham-footer-bottom">© 2020 Arham. All rights reserved.</div>
  </footer>;
};

export default Footer;
