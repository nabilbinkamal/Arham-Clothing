import React, { useState, useEffect } from 'react';
import { Save, Truck, Share2, Upload } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import ToggleSwitch from '../../components/ToggleSwitch';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    logo_url: '',
    favicon_url: '',
    hotline: '+880 9611 707982',
    whatsapp_number: '+880 1410 954642',
    contact_email: 'support@arhamclothing.com',
    delivery_dhaka: '80',
    delivery_subcity: '100',
    delivery_outside: '130',
    social_fb: '#',
    social_ig: '#',
    social_tt: '#',
    social_yt: '#',
    social_x: '#',
    support_phone: '+8809677666888',
    support_days: 'Saturday – Thursday',
    support_hours: '9:00 AM – 10:00 PM',
    meta_pixel_id: '',
    meta_api_token: '',
    meta_pixel_active: '0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [metaTestCode, setMetaTestCode] = useState('');
  const [metaTestMessage, setMetaTestMessage] = useState('');

  const handleAssetUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingFavicon(true);

    const formData = new FormData();
    formData.append('asset', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/upload-asset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'logo') {
          setSettings(prev => ({ ...prev, logo_url: data.url }));
        } else {
          setSettings(prev => ({ ...prev, favicon_url: data.url }));
        }
      } else {
        if (res.status === 401 || res.status === 403 || data.error === 'Invalid or expired token.') {
          localStorage.removeItem('adminToken');
          window.location.reload();
        } else {
          alert(data.error || 'Upload failed');
        }
      }
    } catch {
      console.error('Error uploading asset');
      alert('Error uploading file');
    }
    
    if (type === 'logo') setUploadingLogo(false);
    else setUploadingFavicon(false);
  };

  useEffect(() => {
    fetchWithAuth('/api/settings')
      .then(res => res.json())
      .then(data => {
        // Merge with defaults to ensure all keys exist
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch {
      setMessage('Error saving settings.');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleMetaTest = async () => {
    setMetaTestMessage('Sending test event...');
    try {
      const res = await fetchWithAuth('/api/admin/meta/test-event', {
        method: 'POST',
        body: JSON.stringify({ test_event_code: metaTestCode })
      });
      const data = await res.json();
      setMetaTestMessage(res.ok ? 'Test event sent. Check Meta Test Events.' : (data.message || 'Test event failed.'));
    } catch {
      setMetaTestMessage('Network error while sending test event.');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading settings...</div>;

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#fafafa',
    border: '1px solid #ddd',
    color: '#333',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  };

  return (
    <AdminLayout setAdminAuth={() => {}}>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Store Settings</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Configure your delivery charges and social media connections.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Branding Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Share2 size={20} /> Brand Assets
          </h3>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>Provide direct image URLs for your logo and favicon.</p>
          <div className="admin-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Logo URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" name="logo_url" value={settings.logo_url || ''} onChange={handleChange} style={inputStyle} placeholder="https://example.com/logo.png" />
                <label style={{
                  background: '#111', color: '#fff', padding: '0 20px', borderRadius: '6px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', opacity: uploadingLogo ? 0.7 : 1,
                  transition: 'background 0.2s', border: 'none'
                }} onMouseOver={e => e.currentTarget.style.background = '#333'} onMouseOut={e => e.currentTarget.style.background = '#111'}>
                  {uploadingLogo ? '...' : <><Upload size={16} /> Upload</>}
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAssetUpload(e, 'logo')} />
                </label>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Favicon URL (.ico or .png)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" name="favicon_url" value={settings.favicon_url || ''} onChange={handleChange} style={inputStyle} placeholder="https://example.com/favicon.ico" />
                <label style={{
                  background: '#111', color: '#fff', padding: '0 20px', borderRadius: '6px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', opacity: uploadingFavicon ? 0.7 : 1,
                  transition: 'background 0.2s', border: 'none'
                }} onMouseOver={e => e.currentTarget.style.background = '#333'} onMouseOut={e => e.currentTarget.style.background = '#111'}>
                  {uploadingFavicon ? '...' : <><Upload size={16} /> Upload</>}
                  <input type="file" style={{ display: 'none' }} accept=".ico,.png" onChange={(e) => handleAssetUpload(e, 'favicon')} />
                </label>
              </div>
            </div>
          </div>
        </div>



        {/* Contact Info Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Share2 size={20} /> Contact Information
          </h3>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>This info will be displayed on the top bar and floating WhatsApp widget.</p>
          <div className="admin-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Hotline</label>
              <input type="text" name="hotline" value={settings.hotline} onChange={handleChange} style={inputStyle} placeholder="+880 9611 707982" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <input type="text" name="whatsapp_number" value={settings.whatsapp_number} onChange={handleChange} style={inputStyle} placeholder="+880 1410 954642" />
            </div>
            <div>
              <label style={labelStyle}>Contact Email</label>
              <input type="text" name="contact_email" value={settings.contact_email} onChange={handleChange} style={inputStyle} placeholder="support@arhamclothing.com" />
            </div>
          </div>
        </div>

        {/* Customer Care Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Share2 size={20} /> Customer Care (Footer)
          </h3>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>This info is displayed in the Footer under Customer Care.</p>
          <div className="admin-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Support Phone Number</label>
              <input type="text" name="support_phone" value={settings.support_phone} onChange={handleChange} style={inputStyle} placeholder="+8809677666888" />
            </div>
            <div>
              <label style={labelStyle}>Support Days</label>
              <input type="text" name="support_days" value={settings.support_days} onChange={handleChange} style={inputStyle} placeholder="Saturday – Thursday" />
            </div>
            <div>
              <label style={labelStyle}>Support Hours</label>
              <input type="text" name="support_hours" value={settings.support_hours} onChange={handleChange} style={inputStyle} placeholder="9:00 AM – 10:00 PM" />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Truck size={20} /> Delivery Charges
          </h3>
          <div className="admin-grid-3">
            <div>
              <label style={labelStyle}>Inside Dhaka City (৳)</label>
              <input type="number" name="delivery_dhaka" value={settings.delivery_dhaka} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Dhaka Sub-City (৳)</label>
              <input type="number" name="delivery_subcity" value={settings.delivery_subcity} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>All over Bangladesh (৳)</label>
              <input type="number" name="delivery_outside" value={settings.delivery_outside} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Share2 size={20} /> Social Media Links
          </h3>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>Leave empty or "#" if you do not have that social account.</p>
          
          <div className="admin-grid-2">
            <div>
              <label style={labelStyle}>Facebook URL</label>
              <input type="text" name="social_fb" value={settings.social_fb} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Instagram URL</label>
              <input type="text" name="social_ig" value={settings.social_ig} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>TikTok URL</label>
              <input type="text" name="social_tt" value={settings.social_tt} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>YouTube URL</label>
              <input type="text" name="social_yt" value={settings.social_yt} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>X (Twitter) URL</label>
              <input type="text" name="social_x" value={settings.social_x} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Meta Pixel Settings */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
            <Share2 size={20} /> Meta Pixel & Conversions API
          </h3>
          
          <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Enable Meta Pixel</label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: settings.meta_pixel_active === '0' ? '#999' : '#111' }}>{settings.meta_pixel_active === '0' ? 'Disabled' : 'Enabled'}</span>
                <ToggleSwitch checked={settings.meta_pixel_active !== '0'} label="Toggle Meta Pixel" onChange={(checked) => setSettings({...settings, meta_pixel_active: checked ? '1' : '0'})} />
              </label>
            </div>
          </div>

          <div className="admin-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Meta Pixel ID</label>
              <input type="text" name="meta_pixel_id" value={settings.meta_pixel_id || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. 2125977295008581" />
            </div>
            <div>
              <label style={labelStyle}>Conversions API Token</label>
              <textarea name="meta_api_token" value={settings.meta_api_token || ''} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="EAAV9vsDeZAfYBS..."></textarea>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <label style={labelStyle}>Meta Test Event Code</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={metaTestCode} onChange={e => setMetaTestCode(e.target.value)} style={{ ...inputStyle, flex: '1 1 220px' }} placeholder="TEST12345" />
                <button type="button" onClick={handleMetaTest} disabled={!metaTestCode.trim()} style={{ background: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', padding: '12px 16px', fontWeight: '600', cursor: metaTestCode.trim() ? 'pointer' : 'not-allowed' }}>Send Test Event</button>
              </div>
              {metaTestMessage && <p role="status" style={{ margin: '10px 0 0', color: metaTestMessage.includes('sent') ? '#2e7d32' : '#c62828', fontSize: '13px' }}>{metaTestMessage}</p>}
              <p style={{ margin: '8px 0 0', color: '#777', fontSize: '12px' }}>Create the code in Meta Events Manager → Test Events, then send a test Purchase event.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
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
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && <span style={{ color: message.includes('success') ? '#2e7d32' : '#d32f2f', fontWeight: '600', fontSize: '14px', background: message.includes('success') ? '#e8f5e9' : '#ffebee', padding: '8px 16px', borderRadius: '6px' }}>{message}</span>}
        </div>

      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
