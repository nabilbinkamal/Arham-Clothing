import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserContext } from '../context/UserContext';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const UserProfile = () => {
  const { user, userToken, logout, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userToken) {
      fetch('/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
          console.error(data.error);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Failed to load orders', err);
        setOrders([]);
        setLoadingOrders(false);
      });
    } else if (user) {
      // If user is loaded but no token, we can't fetch orders
      setLoadingOrders(false);
    }
  }, [userToken, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ phone, address })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        const updatedUser = { ...user, phone, address };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusStep = (status) => {
    if (status === 'Pending') return 1;
    if (status === 'Processing') return 2;
    if (status === 'Shipped') return 3;
    if (status === 'Delivered') return 4;
    return 0; // Cancelled or unknown
  };

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <Header />
      <main style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '70vh' }}>
        <div className="profile-header-card">
          <img src={user.photo_url || user.photoURL} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #111' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{user.name}</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>{user.email}</p>
            {!isEditing && (
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                <p><strong>Address:</strong> {user.address || 'Not set'}</p>
                <button onClick={() => setIsEditing(true)} style={{ background: '#111', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', marginTop: '8px', cursor: 'pointer', fontSize: '12px' }}>Edit Profile</button>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSaveProfile} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Edit Profile Information</h3>
            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Phone Number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Delivery Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={savingProfile} style={{ background: '#111', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </form>
        )}

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #111', paddingBottom: '10px', display: 'inline-block' }}>My Orders</h2>
        
        {loadingOrders ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading order history...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#f5f5f5', padding: '40px', textAlign: 'center', borderRadius: '12px', color: '#666', border: '1px dashed #ccc' }}>
            You haven't placed any orders yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => {
              const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
              const isExpanded = expandedOrder === order.id;
              const step = getStatusStep(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div key={order.id} style={{ border: '1px solid #eaeaea', borderRadius: '12px', background: 'white', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  {/* Card Header (Always Visible) */}
                  <div 
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    style={{ padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? '#fafafa' : 'white', transition: 'background 0.2s' }}
                  >
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' }}>Order ID</p>
                        <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>#{order.id}</p>
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' }}>Date Placed</p>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' }}>Total Amount</p>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111' }}>৳{order.total_amount}</p>
                      </div>
                      <div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' }}>Status</p>
                        <span style={{ 
                          background: isCancelled ? '#ffebee' : order.status === 'Delivered' ? '#e8f5e9' : order.status === 'Pending' ? '#fff3e0' : '#e3f2fd', 
                          color: isCancelled ? '#c62828' : order.status === 'Delivered' ? '#2e7d32' : order.status === 'Pending' ? '#ef6c00' : '#1565c0',
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 'bold' 
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ color: '#111', background: '#f5f5f5', padding: '8px', borderRadius: '50%' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #eaeaea', background: 'white' }}>
                      
                      {/* Timeline */}
                      {!isCancelled && (
                        <div style={{ margin: '30px 0', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                            {/* Step 1: Pending */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? '#111' : '#eee', color: step >= 1 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                                <Clock size={16} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: step >= 1 ? 'bold' : '500', color: step >= 1 ? '#111' : '#999' }}>Pending</span>
                            </div>
                            
                            {/* Step 2: Processing */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? '#111' : '#eee', color: step >= 2 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                                <Package size={16} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: step >= 2 ? 'bold' : '500', color: step >= 2 ? '#111' : '#999' }}>Processing</span>
                            </div>

                            {/* Step 3: Shipped */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? '#111' : '#eee', color: step >= 3 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                                <Truck size={16} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: step >= 3 ? 'bold' : '500', color: step >= 3 ? '#111' : '#999' }}>Shipped</span>
                            </div>

                            {/* Step 4: Delivered */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 4 ? '#2e7d32' : '#eee', color: step >= 4 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                                <CheckCircle size={16} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: step >= 4 ? 'bold' : '500', color: step >= 4 ? '#2e7d32' : '#999' }}>Delivered</span>
                            </div>
                          </div>
                          {/* Progress Line Background */}
                          <div style={{ position: 'absolute', top: '16px', left: '12.5%', right: '12.5%', height: '2px', background: '#eee', zIndex: 1 }}></div>
                          {/* Progress Line Active */}
                          <div style={{ position: 'absolute', top: '16px', left: '12.5%', height: '2px', background: '#111', zIndex: 1, width: `${(Math.max(0, step - 1) / 3) * 75}%`, transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                      )}

                      {isCancelled && (
                        <div style={{ margin: '20px 0', padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                          This order was cancelled.
                        </div>
                      )}

                      {/* Tracking Info */}
                      {order.tracking_id && (
                        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: '600', marginBottom: '4px' }}>Tracking Information</p>
                            <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Tracking ID: <span style={{ color: '#1565c0' }}>{order.tracking_id}</span></p>
                          </div>
                        </div>
                      )}

                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Ordered Items</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {items && items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '16px', border: '1px solid #eaeaea', padding: '12px', borderRadius: '8px' }}>
                            <img src={item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/80'} alt={item.title} style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <h5 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>{item.title}</h5>
                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Size: <b>{item.size}</b> | Qty: <b>{item.quantity}</b></p>
                              </div>
                              <p style={{ fontWeight: 'bold', fontSize: '15px', margin: 0, color: '#111' }}>৳{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '24px', padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#111' }}>Shipping Details</h4>
                          <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.5', margin: 0 }}>
                            <b>{order.customer_name}</b><br />
                            {order.phone}<br />
                            {order.address}<br />
                            {order.city}{order.postal_code ? `, ${order.postal_code}` : ''}
                          </p>
                        </div>
                        
                        {(order.status === 'Delivered' || order.status === 'Shipped') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/invoice/${order.id}`, '_blank');
                            }}
                            style={{ background: '#111', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                          >
                            Print Invoice
                          </button>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default UserProfile;
