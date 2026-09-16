import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';

const PrintInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Hide standard UI elements since this page is for printing
    document.title = `Invoice - Order #${id}`;
    
    Promise.all([
      fetchWithAuth(`/api/orders/${id}`).then(res => {
        if (!res.ok) throw new Error('Order not found or unauthorized');
        return res.json();
      }),
      fetch('/api/public-settings').then(res => res.json())
    ])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData);
        setLoading(false);
        // Wait for images to load, then trigger print
        setTimeout(() => {
          window.print();
        }, 500);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading invoice...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;

  const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#111',
      background: '#fff'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="ARHAM CLOTHING" style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>ARHAM CLOTHING</h1>
          )}
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
            <p style={{ margin: 0 }}>{settings.contact_email || 'contact@arhamclothing.com'}</p>
            <p style={{ margin: 0 }}>{settings.hotline || '+880 9611 707982'}</p>
            <p style={{ margin: 0 }}>Dhaka, Bangladesh</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice</h2>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>Order #{order.id}</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
            Date: {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Bill To</h3>
          <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0' }}>{order.customer_name}</p>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{order.phone}</p>
          {order.email && <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{order.email}</p>}
        </div>
        <div style={{ flex: 1, paddingLeft: '20px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Ship To</h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {order.address}<br />
            {order.city} {order.postal_code ? `- ${order.postal_code}` : ''}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: '600' }}>
            Status: <span style={{ textTransform: 'uppercase' }}>{order.status}</span>
          </p>
          {order.tracking_id && (
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              Tracking: <strong>{order.tracking_id}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #111', fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>Item Description</th>
            <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #111', fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>Size</th>
            <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #111', fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #111', fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #111', fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={item.selectedImage || item.imageUrl || 'https://via.placeholder.com/40'} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.title}</span>
              </td>
              <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '14px' }}>{item.size || '-'}</td>
              <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</td>
              <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '14px' }}>৳{item.price}</td>
              <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>৳{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
            <span style={{ color: '#555' }}>Subtotal</span>
            <span>৳{items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#555' }}>Shipping (Included in Total)</span>
            <span>৳{order.total_amount - items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>৳{order.total_amount}</span>
          </div>
          <p style={{ textAlign: 'right', margin: 0, fontSize: '12px', color: '#888', fontWeight: '600' }}>Payment Method: Cash On Delivery</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111' }}>Thank you for shopping with ARHAM CLOTHING!</p>
        <p style={{ margin: 0 }}>If you have any questions about this invoice, please contact us at {settings.contact_email || 'support@arhamclothing.com'}.</p>
      </div>

      {/* Action Buttons (Hidden in print) */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}
      </style>
      <div className="no-print" style={{ marginTop: '40px', textAlign: 'center' }}>
        <button 
          onClick={() => window.print()} 
          style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', marginRight: '12px' }}
        >
          Print Again
        </button>
        <button 
          onClick={() => window.close()} 
          style={{ background: '#f5f5f5', color: '#111', border: '1px solid #ddd', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
        >
          Close Window
        </button>
      </div>
    </div>
  );
};

export default PrintInvoice;
