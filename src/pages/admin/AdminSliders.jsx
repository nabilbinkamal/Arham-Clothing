import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from './AdminDashboard';
import ToggleSwitch from '../../components/ToggleSwitch';
import { Image, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

const AdminSliders = ({ setAdminAuth }) => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [imageFile, setImageFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchSliders = () => {
    fetchWithAuth('/api/sliders')
      .then(res => res.json())
      .then(data => {
        setSliders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('link_url', linkUrl);
    formData.append('is_active', isActive);

    try {
      const res = await fetchWithAuth('/api/sliders', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setImageFile(null);
        setLinkUrl('');
        setIsActive(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchSliders();
      } else {
        alert('Failed to upload slider');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading slider');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slider image?')) return;
    try {
      await fetchWithAuth(`/api/sliders/${id}`, { method: 'DELETE' });
      fetchSliders();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetchWithAuth(`/api/sliders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchSliders();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Hero Sliders</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Manage the banner slider images on your home page.</p>
        </div>
      </div>

      <div className="admin-grid-1fr-2fr" style={{ display: "grid", gap: "32px", alignItems: "start" }}>
        {/* Create Slider Form */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Add New Slider
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Banner Image <span style={{color: 'red'}}>*</span></label>
              <div style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#fafafa' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  id="sliderImageUpload"
                  required
                />
                <label htmlFor="sliderImageUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Image size={32} color="#888" />
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {imageFile ? imageFile.name : 'Click to select an image'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Link URL (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fafafa', border: '1px solid #ddd', borderRadius: '6px', padding: '0 12px' }}>
                <LinkIcon size={16} color="#888" />
                <input 
                  type="text" 
                  value={linkUrl} 
                  onChange={e => setLinkUrl(e.target.value)} 
                  placeholder="/shop?cat=men" 
                  style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }} 
                />
              </div>
              <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Where should users go when they click the banner?</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <ToggleSwitch checked={isActive} label="Toggle slider active status" onChange={setIsActive} />
              <label htmlFor="isActive" style={{ fontSize: '14px', color: '#333', cursor: 'pointer', fontWeight: '500' }}>Active (Show on website)</label>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ padding: '14px', background: '#111', color: 'white', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '8px' }}
            >
              {submitting ? 'Uploading...' : 'Upload Slider'}
            </button>
          </form>
        </div>

        {/* Existing Sliders List */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Active & Past Sliders</h3>
          
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading sliders...</div>
          ) : sliders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ddd' }}>
              <Image size={40} color="#ccc" style={{ marginBottom: '12px' }} />
              <p>No sliders found. Upload one to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sliders.map(slider => (
                <div key={slider.id} style={{ display: 'flex', gap: '16px', background: '#fafafa', border: '1px solid #eaeaea', padding: '16px', borderRadius: '8px', alignItems: 'center' }}>
                  <img src={slider.image_url} alt="Slider" style={{ width: '160px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', background: slider.is_active ? '#e8f5e9' : '#f5f5f5', color: slider.is_active ? '#2e7d32' : '#888', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {slider.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {slider.link_url && (
                      <p style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LinkIcon size={12} /> {slider.link_url}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: '#888' }}>Uploaded: {new Date(slider.created_at).toLocaleDateString()}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ToggleSwitch checked={Boolean(slider.is_active)} label={`Toggle slider ${slider.id}`} onChange={() => toggleStatus(slider.id, slider.is_active)} />
                    <button 
                      onClick={() => handleDelete(slider.id)}
                      style={{ padding: '8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Delete Slider"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSliders;
