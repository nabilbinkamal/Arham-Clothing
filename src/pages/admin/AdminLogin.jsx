import { fetchWithAuth } from '../../utils/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';
import Logo from '../../components/Logo';
import { auth, provider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

const AdminLogin = ({ setAdminAuth }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await fetchWithAuth('/api/admin/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
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
      console.error(err);
      setError('Google Sign-in was cancelled or failed.');
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
          style={{ width: '100%', background: '#111', color: 'white', padding: '16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'background 0.2s', fontSize: '15px' }}
          onMouseOver={e => e.currentTarget.style.background = '#333'}
          onMouseOut={e => e.currentTarget.style.background = '#111'}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', background: 'white', padding: '2px', borderRadius: '50%' }} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
