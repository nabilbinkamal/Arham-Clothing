import React, { createContext, useState, useEffect } from 'react';
import { triggerGoogleLogin } from '../googleAuth';

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
    // Restore user and token from local storage
    const storedUser = readStoredUser();
    const token = localStorage.getItem('userToken');
    if (storedUser && token) {
      setUser(storedUser);
      setUserToken(token);
    } else {
      setUser(null);
      setUserToken(null);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    try {
      const { accessToken } = await triggerGoogleLogin();

      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const data = await res.json();
      
      if (data.success) {
        setUserToken(data.token);
        setUser(data.user);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      const errorMsg = err.message || '';
      if (
        errorMsg.includes('popup_closed') || 
        errorMsg.includes('user_cancel') || 
        errorMsg.includes('cancel') ||
        errorMsg.includes('closed_by_user')
      ) {
        return { success: false, cancelled: true, message: 'Sign-in cancelled' };
      }
      return { success: false, message: errorMsg || 'Google Sign-in failed.' };
    }
  };

  const logout = () => {
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
