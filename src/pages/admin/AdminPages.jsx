import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import ToggleSwitch from '../../components/ToggleSwitch';

const AdminPages = ({ setAdminAuth }) => {
  const [pages, setPages] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadPages = async () => {
      try {
        const res = await fetchWithAuth('/api/admin/pages');
        const data = await res.json();
        setPages(data);
        if (data.length > 0) {
          setSelectedKey(currentKey => {
            if (currentKey) return currentKey;
            setContent(data[0].content);
            setIsActive(data[0].is_active !== 0 && data[0].is_active !== false);
            return data[0].page_key;
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadPages();
  }, []);

  const handlePageChange = (key) => {
    setSelectedKey(key);
    const p = pages.find(p => p.page_key === key);
    setContent(p ? p.content : '');
    setIsActive(p ? (p.is_active !== 0 && p.is_active !== false) : true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetchWithAuth(`/api/admin/pages/${selectedKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, is_active: isActive ? 1 : 0 })
      });
      const data = await res.json();
      if (data.message) {
        setMessage('Page saved successfully!');
        setPages(prev => prev.map(p => p.page_key === selectedKey ? { ...p, content, is_active: isActive ? 1 : 0 } : p));
      } else {
        setMessage('Failed to save page.');
      }
    } catch {
      setMessage('Error saving page.');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <AdminLayout setAdminAuth={setAdminAuth}><div style={{ padding: '24px' }}>Loading pages...</div></AdminLayout>;

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#111' }}>Manage Custom Pages</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>Edit your custom informational pages here (Stores, Corporate, Careers). HTML tags and inline styles are fully supported.</p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {pages.map(p => (
            <button
              key={p.page_key}
              onClick={() => handlePageChange(p.page_key)}
              style={{
                padding: '10px 20px',
                background: selectedKey === p.page_key ? '#111' : '#f0f0f0',
                color: selectedKey === p.page_key ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {p.title} {(!p.is_active && p.is_active !== undefined) && <span style={{ fontSize: '10px', color: '#ff4444', marginLeft: '6px' }}>(Disabled)</span>}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <ToggleSwitch checked={isActive} label="Toggle page active status" onChange={setIsActive} />
            <span style={{ fontWeight: '700', color: '#111' }}>Enable Page</span>
            <span style={{ fontSize: '13px', color: '#666' }}>If disabled, customers will see a "Page Disabled" message when trying to access this page.</span>
          </div>

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
              <Save size={18} /> {saving ? 'Saving...' : 'Save Page'}
            </button>
            {message && <span style={{ color: message.includes('success') ? '#2e7d32' : '#d32f2f', fontWeight: '600', fontSize: '14px', background: message.includes('success') ? '#e8f5e9' : '#ffebee', padding: '8px 16px', borderRadius: '6px' }}>{message}</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
