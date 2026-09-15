import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Browse our collection, select your preferred size, and click "Add to Bag". Once you\'re ready, proceed to checkout and fill in your delivery details. We offer Cash on Delivery (COD) nationwide.'
  },
  {
    question: 'What are the delivery charges and time?',
    answer: 'Delivery charges depend on your location (Inside Dhaka: 60 BDT, Outside Dhaka: 120 BDT). Delivery typically takes 2-3 days inside Dhaka and 3-5 days outside Dhaka.'
  },
  {
    question: 'Can I return or exchange my order?',
    answer: 'Yes, we have a 7-day return and exchange policy. Please ensure the item is unworn, unwashed, and has all original tags attached. For more details, check our Refund Policy page.'
  },
  {
    question: 'How do I track my order?',
    answer: 'You can use the "Track Order" link in the header profile dropdown or footer. Enter your order ID and phone number to see the current status of your delivery.'
  },
  {
    question: 'Do you have any physical stores?',
    answer: 'We operate primarily online to bring you the best prices. However, you can check our "Stores" page for any pop-up locations or partner outlets.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/pages/faq')
      .then(res => res.json())
      .then(data => {
        setPage(data);
        setPageLoading(false);
      })
      .catch(() => {
        setPageLoading(false);
      });
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <h1 className="page-title">{page.title || 'FREQUENTLY ASKED QUESTIONS'}</h1>
        <div 
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <button
              onClick={() => toggleFaq(idx)}
              className={`faq-question ${openIndex === idx ? 'active' : ''}`}
            >
              {faq.question}
              <span className="faq-icon">+</span>
            </button>
            
            {openIndex === idx && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="faq-footer">
        <p style={{ color: 'var(--text-mid)', marginBottom: '16px' }}>Still have questions?</p>
        <a href="/contact" className="btn-outline">
          CONTACT SUPPORT
        </a>
      </div>
    </div>
  );
};

export default FAQ;
