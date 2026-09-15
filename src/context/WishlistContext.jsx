import React, { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aureon_wishlist') || '[]');
      setWishlist(Array.isArray(stored) ? stored : []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    }
  }, []);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(p => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      try {
        localStorage.setItem('aureon_wishlist', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save wishlist', err);
      }
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
