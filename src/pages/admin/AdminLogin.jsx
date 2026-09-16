import { fetchWithAuth } from '../../utils/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';
import Logo from '../../components/Logo';
import { triggerGoogleLogin } from '../../googleAuth';

const AdminLogin = ({ setAdminAuth }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await triggerGoogleLogin();
      
      const res = await fetchWithAuth('/api/admin/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const data = await res.json();
      
      if (data.success) {
        setAdminAuth(true);
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Access Denied: You do not have admin privileges.');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      const errMsg = err.message || '';
      if (!errMsg.includes('popup_closed') && !errMsg.includes('user_cancel') && !errMsg.includes('cancel')) {
        setError(errMsg || 'Google Sign-in was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Logo color="#111" size={32} />
          <h2 style={{ marginTop: '16px', fontSize: '20px', color: '#333' }}>Admin Portal Access</h2>
          <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginTop: '8px' }}>
            Authorized personnel only. Please sign in with your corporate Google account.
          </p>
        </div>
        
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ width: '100%', background: '#111', color: 'white', padding: '16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'background 0.2s', fontSize: '15px' }}
          onMouseOver={e => !loading && (e.currentTarget.style.background = '#333')}
          onMouseOut={e => !loading && (e.currentTarget.style.background = '#111')}
        >
          <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {loading ? 'Connecting to Google...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
