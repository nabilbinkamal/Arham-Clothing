import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Plus, Trash2, Edit2, X, MessageSquare, CreditCard, Save } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';
import ToggleSwitch from '../../components/ToggleSwitch';

const AdminAnnouncements = ({ setAdminAuth }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [type, setType] = useState('banner');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const [settings, setSettings] = useState({
    top_bar_text: '',
    top_bar_active: '1',
    promo_bar_text: '',
    promo_bar_active: '1',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const { addToast } = useContext(ToastContext);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetchWithAuth('/api/announcements');
      setAnnouncements(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchWithAuth('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(err => console.error(err));
  }, []);

  const resetForm = () => {
    setType('banner'); setMessage(''); setLinkUrl(''); setIsActive(true); setImageFile(null);
    setEditingId(null); setShowForm(false);
  };

  const handleEditClick = (a) => {
    setType(a.type);
    setMessage(a.message);
    setLinkUrl(a.link_url || '');
    setIsActive(a.is_active === 1);
    setImageFile(null);
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
      const method = editingId ? 'PUT' : 'POST';
      
      const formData = new FormData();
      formData.append('type', type);
      formData.append('message', message);
      formData.append('link_url', linkUrl);
      formData.append('is_active', isActive);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      await fetchWithAuth(url, {
        method,
        body: formData
      });
      
      addToast(editingId ? 'Announcement updated!' : 'Announcement added!', 'success');
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      addToast('Failed to save announcement.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this announcement?')) return;
    try {
      await fetchWithAuth(`/api/announcements/${id}`, { method: 'DELETE' });
      addToast('Announcement deleted!', 'success');
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete announcement.', 'error');
    }
  };

  const toggleActive = async (a) => {
    try {
      await fetchWithAuth(`/api/announcements/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, is_active: a.is_active ? 0 : 1 })
      });
      addToast(a.is_active ? 'Announcement disabled.' : 'Announcement enabled.', 'info');
      fetchAnnouncements();
    } catch {
      addToast('Failed to toggle status.', 'error');
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          top_bar_text: settings.top_bar_text,
          top_bar_active: settings.top_bar_active,
          promo_bar_text: settings.promo_bar_text,
          promo_bar_active: settings.promo_bar_active
        })
      });
      if (res.ok) {
        addToast('Global announcements updated!', 'success');
      } else {
        addToast('Failed to update.', 'error');
      }
    } catch {
      addToast('Error saving settings.', 'error');
    }
    setSavingSettings(false);
  };

  const inputStyle = { width: '100%', padding: '12px 14px', background: '#fafafa', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#333' };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manage Announcements</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> New Announcement
          </button>
        )}
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
          Global Announcement Bars
        </h3>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>Manage the top black bar and the floating promo button on the homepage.</p>
        <form onSubmit={handleSettingsSave} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Top Header Text</label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: settings.top_bar_active === '0' ? '#999' : '#111' }}>{settings.top_bar_active === '0' ? 'Disabled' : 'Enabled'}</span>
                  <ToggleSwitch checked={settings.top_bar_active !== '0'} label="Toggle top bar" onChange={(c) => setSettings({...settings, top_bar_active: c ? '1' : '0'})} />
                </label>
              </div>
              <input type="text" value={settings.top_bar_text || ''} onChange={e => setSettings({...settings, top_bar_text: e.target.value})} style={inputStyle} placeholder="NATIONWIDE CASH ON DELIVERY AVAILABLE" />
            </div>

            <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Floating Promo Bar</label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: settings.promo_bar_active === '0' ? '#999' : '#111' }}>{settings.promo_bar_active === '0' ? 'Disabled' : 'Enabled'}</span>
                  <ToggleSwitch checked={settings.promo_bar_active !== '0'} label="Toggle promo bar" onChange={(c) => setSettings({...settings, promo_bar_active: c ? '1' : '0'})} />
                </label>
              </div>
              <input type="text" value={settings.promo_bar_text || ''} onChange={e => setSettings({...settings, promo_bar_text: e.target.value})} style={inputStyle} placeholder="🎉 LIMITED OFFER: FREE SHIPPING" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={savingSettings} style={{ background: '#111', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> {savingSettings ? 'Saving...' : 'Save Global Announcements'}
            </button>
          </div>
        </form>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{editingId ? 'Edit Custom Announcement' : 'Add Custom Announcement'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Announcement Type</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="type" value="banner" checked={type === 'banner'} onChange={() => setType('banner')} />
                  <CreditCard size={18} /> Top Banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="type" value="popup" checked={type === 'popup'} onChange={() => setType('popup')} />
                  <MessageSquare size={18} /> Modal Popup
                </label>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Message {type === 'banner' && '*'}</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required={type === 'banner'} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} placeholder="Enter the announcement message..." />
            </div>
            
            {type === 'popup' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Popup Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Upload an image for the promotional popup.</p>
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Link URL (Optional)</label>
              <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g. /shop?cat=men" />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToggleSwitch checked={isActive} label="Toggle announcement active status" onChange={setIsActive} />
              <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '500' }}>Active (Show on website)</label>
            </div>
            
            <div>
              <button type="submit" style={{ background: '#111', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingId ? 'Update Announcement' : 'Save Custom Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', padding: '20px', borderBottom: '1px solid #eee' }}>Custom Announcements</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Message</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No custom announcements added yet.</td></tr>
            ) : (
              announcements.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #eee', opacity: a.is_active ? 1 : 0.6 }}>
                  <td style={{ padding: '16px', fontWeight: '600' }}>
                    <span style={{ display: 'inline-block', background: a.type === 'banner' ? '#e8f4f8' : '#fff3cd', color: a.type === 'banner' ? '#2980b9' : '#d35400', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' }}>
                      {a.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#333' }}>{a.message || (a.image_url ? '(Image Only)' : '')}</div>
                    {a.link_url && <div style={{ fontSize: '12px', color: '#3498DB', marginTop: '4px' }}>Link: {a.link_url}</div>}
                    {a.image_url && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Has Image</div>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <ToggleSwitch checked={Boolean(a.is_active)} label={`Toggle ${a.type} announcement`} onChange={() => toggleActive(a)} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleEditClick(a)} style={{ color: '#3498DB', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
