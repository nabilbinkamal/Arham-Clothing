import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Package, CheckCircle, Clock, Truck, X, Eye, MapPin, Mail, Phone, Calendar, Trash2, Search, ArrowUpDown, ChevronRight } from 'lucide-react';

const AdminOrders = ({ setAdminAuth }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if(!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/orders/${orderToDelete.id}`, { method: 'DELETE' });
      if(res.ok) {
        setOrders(orders.filter(order => order.id !== orderToDelete.id));
        setOrderToDelete(null);
        if(selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      }
    } catch (e) {
      console.error('Failed to delete order', e);
    }
    setIsDeleting(false);
  };

  const fetchOrders = () => {
    fetchWithAuth('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetchWithAuth(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_id: trackingId || undefined })
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, tracking_id: trackingId || selectedOrder.tracking_id });
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // 1. Filter by Status
  let processedOrders = filter === 'All' ? [...orders] : orders.filter(o => o.status === filter);

  // 2. Search Filter
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    processedOrders = processedOrders.filter(o => 
      String(o.id).includes(term) ||
      (o.customer_name || '').toLowerCase().includes(term) ||
      (o.phone || '').toLowerCase().includes(term) ||
      (o.email || '').toLowerCase().includes(term)
    );
  }

  // 3. Sorting
  processedOrders.sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === 'total_amount') {
      return sortConfig.direction === 'asc' ? a.total_amount - b.total_amount : b.total_amount - a.total_amount;
    } else if (sortConfig.key === 'id') {
      return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
    }
    return 0;
  });

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': { bg: '#fff3e0', color: '#e65100', icon: <Clock size={14} /> },
      'Processing': { bg: '#e3f2fd', color: '#1565c0', icon: <Package size={14} /> },
      'Shipped': { bg: '#f3e5f5', color: '#6a1b9a', icon: <Truck size={14} /> },
      'Delivered': { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} /> },
      'Cancelled': { bg: '#ffebee', color: '#c62828', icon: <X size={14} /> }
    };
    const s = styles[status] || styles['Pending'];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: s.bg, color: s.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
        {s.icon} {status}
      </span>
    );
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Orders</h2>
            <p style={{ color: '#666', marginTop: '4px' }}>View, track, and manage all your customer orders efficiently.</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  background: filter === f ? '#111' : '#f5f5f5', color: filter === f ? 'white' : '#666'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '2px solid #eee' }}>
              <th onClick={() => toggleSort('id')} style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase', cursor: 'pointer' }}>
                Order ID {sortConfig.key === 'id' && <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />}
              </th>
              <th onClick={() => toggleSort('created_at')} style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase', cursor: 'pointer' }}>
                Date {sortConfig.key === 'created_at' && <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />}
              </th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase' }}>Items</th>
              <th onClick={() => toggleSort('total_amount')} style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase', cursor: 'pointer' }}>
                Total {sortConfig.key === 'total_amount' && <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />}
              </th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#555', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading orders...</td></tr>
            ) : processedOrders.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No orders found matching your criteria.</td></tr>
            ) : (
              processedOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '2px' }}>{o.customer_name}</p>
                    <p style={{ fontSize: '12px', color: '#888' }}>{o.phone}</p>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(() => {
                        const items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json;
                        return items.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.selectedImage || item.imageUrl || 'https://via.placeholder.com/40'} alt={item.title} title={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                        ));
                      })()}
                      {(() => {
                        const items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json;
                        if (items.length > 3) {
                          return <div title={`+${items.length - 3} more items`} style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#666', border: '1px solid #eee' }}>+{items.length - 3}</div>
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>৳{o.total_amount}</td>
                  <td style={{ padding: '16px' }}>
                    {/* Inline Status Dropdown */}
                    <select 
                      value={o.status}
                      onChange={(e) => {
                        setTrackingId(o.tracking_id || '');
                        handleStatusChange(o.id, e.target.value);
                      }}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => {
                        setSelectedOrder(o);
                        setTrackingId(o.tracking_id || '');
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8f9fa', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eee'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}
                    >
                      View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Order Details Drawer */}
      <div 
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, 
          opacity: selectedOrder ? 1 : 0, pointerEvents: selectedOrder ? 'auto' : 'none', transition: 'opacity 0.3s ease' 
        }}
        onClick={() => setSelectedOrder(null)}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{ 
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '600px', 
            background: 'white', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
            transform: selectedOrder ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {selectedOrder && (
            <>
              {/* Drawer Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Order #{selectedOrder.id}</h2>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setSelectedOrder(null)} style={{ background: 'white', border: '1px solid #ddd', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={20} color="#666" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                
                {/* Status Update Block */}
                <div style={{ background: 'white', border: '1px solid #eee', padding: '24px', borderRadius: '12px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Fulfillment</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', color: '#666' }}>Order Status</label>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontWeight: '600', outline: 'none' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', color: '#666' }}>Tracking ID</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          placeholder="e.g. STEADFAST-123"
                          style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.status)}
                      style={{ background: '#111', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1 }}
                    >
                      Update Fulfillment
                    </button>
                    <button 
                      onClick={() => window.open(`/invoice/${selectedOrder.id}`, '_blank')} 
                      style={{ background: 'white', color: '#111', border: '1px solid #ddd', cursor: 'pointer', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      Print Invoice
                    </button>
                  </div>
                </div>

                {/* Items Block */}
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Products
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  {(() => {
                    const items = typeof selectedOrder.items_json === 'string' ? JSON.parse(selectedOrder.items_json) : selectedOrder.items_json;
                    return items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '20px', padding: '16px', border: '1px solid #eee', borderRadius: '12px', background: 'white', alignItems: 'center' }}>
                        <img src={item.selectedImage || item.imageUrl || 'https://via.placeholder.com/80'} alt={item.title} style={{ width: '70px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '4px' }}>{item.title}</h4>
                          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>৳{item.price * item.quantity}</span>
                      </div>
                    ));
                  })()}
                </div>

                {/* Customer Block */}
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Customer & Shipping</h3>
                <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                        <Phone size={18} color="#555" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111', margin: 0 }}>{selectedOrder.customer_name}</p>
                        <p style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}><a href={`tel:${selectedOrder.phone}`} style={{ color: '#111', textDecoration: 'none' }}>{selectedOrder.phone}</a></p>
                        {selectedOrder.email && <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}><a href={`mailto:${selectedOrder.email}`} style={{ color: '#666', textDecoration: 'none' }}>{selectedOrder.email}</a></p>}
                      </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '1px', background: '#eaeaea' }}></div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                        <MapPin size={18} color="#555" />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', margin: '0 0 4px 0' }}>Address</p>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#333', margin: 0 }}>
                          {selectedOrder.address}<br />
                          {selectedOrder.city && selectedOrder.postal_code ? `${selectedOrder.city}, ${selectedOrder.postal_code}` : selectedOrder.city}
                        </p>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrder.address}, ${selectedOrder.city || ''} ${selectedOrder.postal_code || ''}`)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#1565c0', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginTop: '6px' }}>View on Maps</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer - Totals */}
              <div style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#666', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Total Amount</span>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>৳{selectedOrder.total_amount}</span>
                </div>
                <button 
                  onClick={() => setOrderToDelete(selectedOrder)}
                  style={{ width: '100%', marginTop: '24px', background: 'transparent', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffebee'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={16} /> Delete Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Professional Delete Confirmation Modal */}
      {orderToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={30} color="#d32f2f" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#111' }}>Delete Order #{orderToDelete.id}?</h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you absolutely sure you want to delete the order from <strong>{orderToDelete.customer_name}</strong>? This action cannot be undone and the data will be lost forever.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#333' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{ flex: 1, padding: '12px', background: '#d32f2f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
