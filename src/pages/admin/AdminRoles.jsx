import React from 'react';
import { AdminLayout } from './AdminDashboard';
import { Shield, Check, X } from 'lucide-react';

const AdminRoles = ({ setAdminAuth }) => {
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full access to all system modules and configuration.',
      color: '#2e7d32',
      bg: '#e8f5e9',
      permissions: {
        store: true,
        cms: true,
        marketing: true,
        system: true
      }
    },
    {
      name: 'Store Manager',
      description: 'Can manage products, orders, and customer data.',
      color: '#1565c0',
      bg: '#e3f2fd',
      permissions: {
        store: true,
        cms: false,
        marketing: false,
        system: false
      }
    },
    {
      name: 'Editor',
      description: 'Can manage website content, pages, and marketing campaigns.',
      color: '#e65100',
      bg: '#fff3e0',
      permissions: {
        store: false,
        cms: true,
        marketing: true,
        system: false
      }
    }
  ];

  const modules = [
    { key: 'store', name: 'Store Operations', desc: 'Orders, Products, Categories, Customers' },
    { key: 'cms', name: 'Content Management', desc: 'Pages, Policies, Sliders, Announcements' },
    { key: 'marketing', name: 'Marketing & SEO', desc: 'Campaigns, SEO Tools, Messages' },
    { key: 'system', name: 'System Settings', desc: 'Users, Roles, Integrations, Audit Logs' }
  ];

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={28} /> Roles & Permissions
          </h2>
          <p style={{ color: '#666', marginTop: '8px' }}>View the access levels and permissions for each administrative role.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <th style={{ padding: '24px', textAlign: 'left', width: '25%' }}>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Module Access</span>
              </th>
              {roles.map(role => (
                <th key={role.name} style={{ padding: '24px', textAlign: 'center', width: '25%' }}>
                  <div style={{ display: 'inline-block', background: role.bg, color: role.color, padding: '8px 16px', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{role.name}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', margin: 0 }}>{role.description}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, index) => (
              <tr key={mod.key} style={{ borderBottom: index === modules.length - 1 ? 'none' : '1px solid #eaeaea' }}>
                <td style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111' }}>{mod.name}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{mod.desc}</p>
                </td>
                {roles.map(role => (
                  <td key={`${role.name}-${mod.key}`} style={{ padding: '24px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {role.permissions[mod.key] ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#e8f5e9', borderRadius: '50%', color: '#2e7d32' }}>
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffebee', borderRadius: '50%', color: '#c62828' }}>
                        <X size={18} strokeWidth={3} />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#111" />
          <strong>Note:</strong> To change a user's role, go to the <a href="/admin/users" style={{ color: '#1565c0', textDecoration: 'none', fontWeight: '600' }}>Users</a> module. Only Super Admins have access to assign roles.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;
