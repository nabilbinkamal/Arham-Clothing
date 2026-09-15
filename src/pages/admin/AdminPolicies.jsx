import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';

const AdminPolicies = ({ setAdminAuth }) => {
  const [policies, setPolicies] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await fetchWithAuth('/api/admin/policies');
        const data = await res.json();
        setPolicies(data);
        if (data.length > 0) {
          setSelectedKey(currentKey => {
            if (currentKey) return currentKey;
            setContent(data[0].content);
            return data[0].policy_key;
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadPolicies();
  }, []);

  const handlePolicyChange = (key) => {
    setSelectedKey(key);
    const p = policies.find(p => p.policy_key === key);
    setContent(p ? p.content : '');
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetchWithAuth(`/api/admin/policies/${selectedKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Policy saved successfully!');
        // Update local state
        setPolicies(prev => prev.map(p => p.policy_key === selectedKey ? { ...p, content } : p));
      } else {
        setMessage('Failed to save policy.');
      }
    } catch {
      setMessage('Error saving policy.');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <AdminLayout setAdminAuth={setAdminAuth}><div style={{ padding: '24px' }}>Loading policies...</div></AdminLayout>;

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#111' }}>Manage Policies</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>Edit your legal and informational pages here. HTML tags are supported.</p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {policies.map(p => (
            <button
              key={p.policy_key}
              onClick={() => handlePolicyChange(p.policy_key)}
              style={{
                padding: '10px 20px',
                background: selectedKey === p.policy_key ? '#111' : '#f0f0f0',
                color: selectedKey === p.policy_key ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {p.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '12px', color: '#111' }}>
              <FileText size={18} /> Page Content (HTML allowed)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                background: '#fafafa',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{
                background: '#111', color: '#fff', border: 'none', padding: '14px 28px', 
                fontSize: '15px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer',
                borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Policy'}
            </button>
            {message && <span style={{ color: message.includes('success') ? '#2e7d32' : '#d32f2f', fontWeight: '600', fontSize: '14px', background: message.includes('success') ? '#e8f5e9' : '#ffebee', padding: '8px 16px', borderRadius: '6px' }}>{message}</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminPolicies;
