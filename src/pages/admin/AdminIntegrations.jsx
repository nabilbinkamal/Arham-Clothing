import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Layers, Truck, CreditCard, MessageSquare, CheckCircle, XCircle, Settings2, X, Save } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';
import { useContext } from 'react';

const INTEGRATION_TYPES = [
  {
    id: 'steadfast',
    name: 'Steadfast Courier',
    category: 'Logistics',
    icon: <Truck size={24} color="#1565c0" />,
    color: '#e3f2fd',
    fields: [
      { key: 'steadfast_api_key', label: 'API Key', type: 'text' },
      { key: 'steadfast_secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'pathao',
    name: 'Pathao Courier',
    category: 'Logistics',
    icon: <Truck size={24} color="#e65100" />,
    color: '#fff3e0',
    fields: [
      { key: 'pathao_client_id', label: 'Client ID', type: 'text' },
      { key: 'pathao_client_secret', label: 'Client Secret', type: 'password' }
    ]
  },
  {
    id: 'sslcommerz',
    name: 'SSLCommerz',
    category: 'Payment',
    icon: <CreditCard size={24} color="#2e7d32" />,
    color: '#e8f5e9',
    fields: [
      { key: 'sslcz_store_id', label: 'Store ID', type: 'text' },
      { key: 'sslcz_store_password', label: 'Store Password', type: 'password' },
      { key: 'sslcz_is_live', label: 'Live Mode (1=Yes, 0=No)', type: 'text' }
    ]
  },
  {
    id: 'bkash',
    name: 'bKash API',
    category: 'Payment',
    icon: <CreditCard size={24} color="#c2185b" />,
    color: '#fce4ec',
    fields: [
      { key: 'bkash_app_key', label: 'App Key', type: 'text' },
      { key: 'bkash_app_secret', label: 'App Secret', type: 'password' },
      { key: 'bkash_username', label: 'Username', type: 'text' },
      { key: 'bkash_password', label: 'Password', type: 'password' }
    ]
  },
  {
    id: 'sms',
    name: 'Bulk SMS Gateway',
    category: 'Communication',
    icon: <MessageSquare size={24} color="#6a1b9a" />,
    color: '#f3e5f5',
    fields: [
      { key: 'sms_api_key', label: 'API Key', type: 'password' },
      { key: 'sms_sender_id', label: 'Sender ID', type: 'text' }
    ]
  }
];

const AdminIntegrations = ({ setAdminAuth }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    fetchWithAuth('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch settings', err);
        setLoading(false);
      });
  };

  const openModal = (integration) => {
    const initialData = {};
    integration.fields.forEach(f => {
      initialData[f.key] = settings[f.key] || '';
    });
    setFormData(initialData);
    setActiveModal(integration);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        addToast('Integration settings saved securely.', 'success');
        setSettings({ ...settings, ...formData });
        setActiveModal(null);
      } else {
        const error = await res.json();
        addToast(error.error || 'Failed to save', 'error');
      }
    } catch (e) {
      addToast('An unexpected error occurred.', 'error');
    }
    setSaving(false);
  };

  const isConfigured = (integration) => {
    return integration.fields.every(f => settings[f.key] && settings[f.key].trim() !== '');
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={28} /> System Integrations
          </h2>
          <p style={{ color: '#666', marginTop: '8px' }}>Manage API keys and connections to third-party logistics, payment, and SMS providers.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading integrations...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {INTEGRATION_TYPES.map(integration => {
            const configured = isConfigured(integration);
            return (
              <div key={integration.id} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: integration.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {integration.icon}
                  </div>
                  {configured ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#2e7d32', background: '#e8f5e9', padding: '4px 10px', borderRadius: '20px' }}>
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#c62828', background: '#ffebee', padding: '4px 10px', borderRadius: '20px' }}>
                      <XCircle size={14} /> Inactive
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#111' }}>{integration.name}</h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', flex: 1 }}>Category: {integration.category}</p>
                
                <button 
                  onClick={() => openModal(integration)}
                  style={{ width: '100%', padding: '10px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseOver={e => e.target.style.background = '#eee'}
                  onMouseOut={e => e.target.style.background = '#f8f9fa'}
                >
                  <Settings2 size={16} /> Configure
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Configuration Modal */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: activeModal.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(activeModal.icon, { size: 18 })}
                </div>
                Configure {activeModal.name}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {activeModal.fields.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>{f.label}</label>
                  <input 
                    type={f.type} 
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    placeholder={`Enter ${f.label}`}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setActiveModal(null)}
                disabled={saving}
                style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#555' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, padding: '12px', background: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {saving ? 'Saving...' : <><Save size={18} /> Save Integration</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminIntegrations;
