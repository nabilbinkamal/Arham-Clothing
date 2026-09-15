import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';
import { UserContext } from '../context/UserContext';
import { Info } from 'lucide-react';
import { getMetaCookie, trackMetaEvent } from '../utils/metaPixel';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { addToast } = useContext(ToastContext);
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    const res = await login();
    if (res.success) {
      addToast('Successfully signed in!', 'success');
      // Update form data with user info
      setFormData(prev => ({
        ...prev,
        name: res.user?.name || prev.name,
        email: res.user?.email || prev.email,
        phone: res.user?.phone || prev.phone,
        address: res.user?.address || prev.address
      }));
    } else if (!res.cancelled) {
      addToast(res.message || 'Login failed', 'error');
    }
  };
  
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    phone: user ? user.phone : '',
    email: user ? user.email : '',
    city: '',
    postal_code: '',
    address: user ? user.address : '',
    area: 'DHAKA', // Inside Dhaka / Outside Dhaka
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address
      }));
    }
  }, [user]);
  
  const [settings, setSettings] = useState({ delivery_dhaka: 80, delivery_subcity: 100, delivery_outside: 130 });

  useEffect(() => {
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      trackMetaEvent('InitiateCheckout', { content_ids: cart.map(item => String(item.id)), content_type: 'product', num_items: cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0), value: cartTotal, currency: 'BDT' });
    }
  }, [cart, cart.length, cartTotal]);

  const deliveryChargeValue = formData.area === 'DHAKA' ? settings.delivery_dhaka : formData.area === 'SUBCITY' ? settings.delivery_subcity : settings.delivery_outside;
  const deliveryCharge = Number.isFinite(Number(deliveryChargeValue)) ? Number(deliveryChargeValue) : 0;
  const grandTotal = cartTotal + deliveryCharge;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty');
    
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          postal_code: formData.postal_code,
          address: formData.address,
          area: formData.area,
          total_amount: grandTotal,
          items: cart,
          user_id: user ? user.id : null,
          meta: { fbp: getMetaCookie('_fbp'), fbc: getMetaCookie('_fbc'), event_source_url: window.location.href }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        trackMetaEvent('Purchase', { content_ids: cart.map(item => String(item.id)), content_type: 'product', num_items: cart.length, value: grandTotal, currency: 'BDT' }, data.eventId);
        clearCart();
        addToast('Order placed successfully! We will contact you soon.', 'success');
        navigate('/');
      } else {
        addToast('Failed to place order. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
    
    setSubmitting(false);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Checkout</h1>
        
        {!user && (
          <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', color: '#0d47a1', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Info size={20} />
              <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                Sign in to save your order history and checkout faster!
              </p>
            </div>
            <button type="button" onClick={handleLoginClick} style={{ background: 'white', color: '#111', border: '1px solid #111', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '16px' }} />
              Login with Google
            </button>
          </div>
        )}

        <div className="checkout-layout">
          
          {/* Form */}
          <div className="checkout-form">
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #111', paddingBottom: '10px', display: 'inline-block' }}>Shipping Details</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="checkout-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Phone Number *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="+880..." />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email Address (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="your@email.com" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>City *</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g. Dhaka" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Postal Code *</label>
                  <input required type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g. 1205" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Delivery Area *</label>
                <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="DHAKA">Inside Dhaka City (৳{settings.delivery_dhaka || 80})</option>
                  <option value="SUBCITY">Dhaka Sub-City (৳{settings.delivery_subcity || 100})</option>
                  <option value="OUTSIDE">All over Bangladesh (৳{settings.delivery_outside || 130})</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Full Address *</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }} placeholder="House No, Road No, Area..."></textarea>
              </div>

              <div style={{ marginTop: '10px', padding: '16px', background: '#f8f9fa', borderRadius: '4px', borderLeft: '4px solid #111' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Payment Method</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Cash on Delivery (COD) is currently the only available payment method.</p>
              </div>

              <button disabled={submitting} type="submit" style={{ background: '#111', color: 'white', padding: '18px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {submitting ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={`${item.id}-${item.size}-${item.selectedImage}`} className="checkout-item">
                  <img src={item.selectedImage || item.imageUrl} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.2', margin: 0, marginBottom: '4px' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Size: {item.size} x {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: '600' }}>৳{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Delivery Charge</span>
              <span style={{ fontWeight: '600' }}>৳{deliveryCharge}</span>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#111' }}>
              <span>Total</span>
              <span>৳{grandTotal}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'right' }}>(Payable on delivery)</p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
