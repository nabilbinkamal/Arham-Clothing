import React, { createContext, useState, useEffect } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

export const UserContext = createContext();

const readStoredUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return stored && typeof stored === 'object' ? stored : null;
  } catch {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a local token, we consider them logged in.
    // But we should verify with Firebase Auth state to keep the name/photo.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = readStoredUser() || {};
        setUser({
          ...storedUser,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo_url: firebaseUser.photoURL
        });
      } else {
        setUser(null);
        setUserToken(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
      }
      setLoading(false);
    });

    // Restore user from local storage immediately to prevent flicker
    const storedUser = readStoredUser();
    if (storedUser) setUser(storedUser);

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      
      if (data.success) {
        setUserToken(data.token);
        setUser(data.user);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || '';
      if (err.code === 'auth/popup-closed-by-user' || 
          err.code === 'auth/cancelled-popup-request' ||
          err.code === 'auth/popup-blocked' ||
          errorMsg.includes('popup-closed-by-user') || 
          errorMsg.includes('cancelled-popup-request') ||
          errorMsg.includes('popup-blocked')) {
        return { success: false, cancelled: true, message: 'Sign-in cancelled' };
      }
      return { success: false, message: errorMsg || 'Google Sign-in failed.' };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserToken(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  };

  return (
    <UserContext.Provider value={{ user, userToken, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
