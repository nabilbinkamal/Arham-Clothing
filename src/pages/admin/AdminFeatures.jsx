import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';
import ToggleSwitch from '../../components/ToggleSwitch';

const AdminFeatures = ({ setAdminAuth }) => {
  const [features, setFeatures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Truck'); // default
  const [isActive, setIsActive] = useState(true);

  const { addToast } = useContext(ToastContext);

  const fetchFeatures = async () => {
    try {
      const res = await fetchWithAuth('/api/features');
      setFeatures(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setIcon('Truck'); setIsActive(true);
    setEditingId(null); setShowForm(false);
  };

  const handleEditClick = (f) => {
    setTitle(f.title);
    setDescription(f.description);
    setIcon(f.icon);
    setIsActive(f.is_active === 1);
    setEditingId(f.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/features/${editingId}` : '/api/features';
      const method = editingId ? 'PUT' : 'POST';
      
      await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, icon, is_active: isActive })
      });
      
      addToast(editingId ? 'Feature updated successfully!' : 'Feature added successfully!', 'success');
      resetForm();
      fetchFeatures();
    } catch (err) {
      console.error(err);
      addToast('Failed to save feature.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this feature?')) return;
    try {
      await fetchWithAuth(`/api/features/${id}`, { method: 'DELETE' });
      addToast('Feature deleted successfully!', 'success');
      fetchFeatures();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete feature.', 'error');
    }
  };

  const toggleActive = async (f) => {
    try {
      await fetchWithAuth(`/api/features/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, is_active: f.is_active ? 0 : 1 })
      });
      addToast(f.is_active ? 'Feature disabled.' : 'Feature enabled.', 'info');
      fetchFeatures();
    } catch {
      addToast('Failed to toggle status.', 'error');
    }
  };

  // Some suggested icons from lucide
  const availableIcons = ['Truck', 'ShieldCheck', 'Clock', 'CreditCard', 'ThumbsUp', 'Star', 'Gift', 'Heart'];

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manage Features</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> Add New Feature
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{editingId ? 'Edit Feature' : 'Add New Feature'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Feature Title (e.g. Free Shipping)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Description (e.g. On all orders over $50)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Icon</label>
              <select value={icon} onChange={e => setIcon(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                {availableIcons.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToggleSwitch checked={isActive} label="Toggle feature active status" onChange={setIsActive} />
              <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '500' }}>Active (Show on website)</label>
            </div>
            
            <div>
              <button type="submit" style={{ background: '#111', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingId ? 'Update Feature' : 'Save Feature'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Feature</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Icon</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No features added yet.</td></tr>
            ) : (
              features.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #eee', opacity: f.is_active ? 1 : 0.6 }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600' }}>{f.title}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{f.description}</div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#555' }}>{f.icon}</td>
                  <td style={{ padding: '16px' }}>
                    <ToggleSwitch checked={Boolean(f.is_active)} label={`Toggle ${f.title}`} onChange={() => toggleActive(f)} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleEditClick(f)} style={{ color: '#3498DB', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit Feature">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(f.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete Feature">
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

export default AdminFeatures;
