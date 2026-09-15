import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/api';
import { AdminLayout } from './AdminDashboard';

const AdminUsers = ({ setAdminAuth }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Manage Users</h2>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>User</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Role</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={u.photo_url || 'https://via.placeholder.com/40'} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600' }}>{u.name}</span>
                    </td>
                    <td style={{ padding: '16px', color: '#555' }}>{u.email}</td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={u.role || 'Customer'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', background: '#f9fafb', outline: 'none' }}
                      >
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Editor">Editor</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px', color: '#888', fontSize: '13px' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
