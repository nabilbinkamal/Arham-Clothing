import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const readStoredCart = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem('arham_cart') || 
      localStorage.getItem('cartItems') || 
      '[]'
    );
    return Array.isArray(stored) ? stored.filter(item => item && item.id && Number(item.quantity) > 0) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    return readStoredCart();
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('arham_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size = 'M', quantity = 1, selectedImage = null) => {
    const imgToUse = selectedImage || product.imageUrl;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size && item.selectedImage === imgToUse);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.size === size && item.selectedImage === imgToUse)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, size, quantity, selectedImage: imgToUse }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size, selectedImage) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.size === size && item.selectedImage === selectedImage)));
  };

  const updateQuantity = (productId, size, selectedImage, newQuantity) => {
    const safeQuantity = Math.floor(Number(newQuantity));
    if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return;
    setCart(prev => prev.map(item => 
      (item.id === productId && item.size === size && item.selectedImage === selectedImage)
        ? { ...item, quantity: safeQuantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const cartCount = cart.reduce((count, item) => count + (Number(item.quantity) || 0), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
