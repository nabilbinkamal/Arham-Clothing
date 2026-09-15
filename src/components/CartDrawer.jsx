import React, { useContext, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} 
        onClick={() => setIsCartOpen(false)} 
        aria-hidden="true"
      />
      
      <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} /> Your Cart ({cart.length})
          </h2>
          <button aria-label="Close cart" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Your cart is empty.</div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.size}-${item.selectedImage}`} style={{ display: 'flex', gap: '16px' }}>
                <img src={item.selectedImage || item.imageUrl} alt={item.title} loading="lazy" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</h4>
                    <button onClick={() => removeFromCart(item.id, item.size, item.selectedImage)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  {item.size && <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Size: {item.size}</p>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                      <button aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.id, item.size, item.selectedImage, item.quantity - 1)} style={{ padding: '4px 8px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.id, item.size, item.selectedImage, item.quantity + 1)} style={{ padding: '4px 8px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>৳{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid #eee', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Subtotal:</span>
              <span>৳{cartTotal}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>Delivery charges will be calculated at checkout.</p>
            <button 
              onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
              style={{ width: '100%', background: '#111', color: 'white', padding: '16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
        
      </div>
    </>
  );
};

export default CartDrawer;
