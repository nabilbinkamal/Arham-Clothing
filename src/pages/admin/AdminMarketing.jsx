import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Mail, Download, Trash2, Calendar } from 'lucide-react';

const AdminMarketing = ({ setAdminAuth }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/subscribers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubscribers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      const res = await fetchWithAuth(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSubscribers(subscribers.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting subscriber');
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Email', 'Subscribed At'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    subscribers.forEach(sub => {
      const row = [
        sub.id,
        `"${sub.email}"`,
        `"${new Date(sub.created_at).toLocaleString()}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link and click it
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `aureon_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Marketing & Subscribers</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Manage your newsletter subscribers and export lists for campaigns.</p>
        </div>
        <button 
          onClick={exportToCSV}
          style={{ background: '#111', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Download size={18} /> Export to CSV
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <Mail size={48} color="#ddd" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>No subscribers yet</h3>
            <p style={{ color: '#888', marginTop: '8px' }}>When users subscribe via the footer newsletter, they will appear here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '600' }}>Email Address</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '600' }}>Subscribed On</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f0f0f0', padding: '8px', borderRadius: '50%' }}>
                      <Mail size={16} color="#666" />
                    </div>
                    {sub.email}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#999" />
                      {new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '8px' }}
                      title="Delete Subscriber"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMarketing;
