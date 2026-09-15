import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Download, Users } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

const AdminCustomers = ({ setAdminAuth }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetchWithAuth('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        addToast('Failed to load customers.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [addToast]);

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Total Orders'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => `"${c.customer_name || ''}","${c.email || ''}","${c.phone || ''}",${c.total_orders}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aureon_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} /> Marketing Customers
        </h2>
        <button 
          onClick={handleExportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This list automatically extracts unique contact information from all your store's orders. Use this list for your email and SMS marketing campaigns.
        </p>
        
        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#333' }}>Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#333' }}>Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#333' }}>Phone</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#333' }}>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px' }}>{c.customer_name}</td>
                    <td style={{ padding: '12px 16px' }}>{c.email}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{c.phone}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#e0f7fa', color: '#006064', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {c.total_orders}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
