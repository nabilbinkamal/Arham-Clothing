import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as FiSearch, Package as FiPackage, Truck as FiTruck, CheckCircle as FiCheckCircle, Clock as FiClock } from 'lucide-react';
import Footer from '../components/Footer';

const statuses = [
  { id: 'Pending', icon: FiClock, label: 'Order Placed' },
  { id: 'Processing', icon: FiPackage, label: 'Processing' },
  { id: 'Shipped', icon: FiTruck, label: 'Shipped' },
  { id: 'Delivered', icon: FiCheckCircle, label: 'Delivered' }
];

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: parseInt(orderId), phone })
      });
      const data = await res.json();
      
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found.');
      }
    } catch {
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    const index = statuses.findIndex(s => s.id.toLowerCase() === (status || '').toLowerCase());
    return index >= 0 ? index : 0;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <div className="container" style={{ flex: 1, padding: '60px 24px', maxWidth: '800px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Track Your Order
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Enter your order ID and the phone number used during checkout.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '40px' }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Order ID</label>
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 1042"
                  required
                  style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  required
                  style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#111', color: 'white', border: 'none', padding: '16px', borderRadius: '6px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              {loading ? 'Tracking...' : 'Track Order'} <FiSearch />
            </button>
            
            {error && (
              <div style={{ padding: '14px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', textAlign: 'center', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="track-order-card"
            >
              <div className="track-order-header">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Order #{order.id}</h3>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ background: '#f3f3f3', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>
                  {order.status || 'Pending'}
                </div>
              </div>

              {/* Timeline */}
              <div className="track-order-timeline">
                {/* Connecting Line */}
                <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '3px', background: '#eee', zIndex: 0 }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(getStatusIndex(order.status) / (statuses.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ height: '100%', background: '#111' }}
                  />
                </div>

                {statuses.map((step, idx) => {
                  const isActive = idx <= getStatusIndex(order.status);
                  const Icon = step.icon;
                  return (
                    <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: '25%' }}>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        style={{ 
                          width: '50px', height: '50px', 
                          borderRadius: '50%', 
                          background: isActive ? '#111' : '#fff', 
                          border: `3px solid ${isActive ? '#111' : '#eee'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isActive ? 'white' : '#aaa',
                          marginBottom: '12px',
                          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        <Icon size={20} />
                      </motion.div>
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: isActive ? '#111' : '#aaa', textAlign: 'center' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Items Summary */}
              <div className="track-order-items-container">
                <h4 className="track-order-details-title">Order Details</h4>
                <div className="track-order-details-grid">
                  {(typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json).map((item, idx) => (
                    <div key={idx} className="track-order-item">
                      <div className="track-order-item-info">
                        {item.image && <img src={item.image} alt={item.title} className="track-order-item-image" />}
                        <div>
                          <p className="track-order-item-title">{item.title}</p>
                          <p className="track-order-item-meta">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: '700' }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', fontSize: '16px', fontWeight: '800' }}>
                  <span>Total Amount</span>
                  <span>৳{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
