import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Clock, Shield, Globe, Activity, FileText } from 'lucide-react';

const AdminAuditLogs = ({ setAdminAuth }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/audit-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch audit logs', err);
        setLoading(false);
      });
  }, []);

  const getActionStyle = (method) => {
    switch(method) {
      case 'POST': return { bg: '#e8f5e9', color: '#2e7d32', label: 'CREATE' };
      case 'PUT': return { bg: '#fff8e1', color: '#f57f17', label: 'UPDATE' };
      case 'DELETE': return { bg: '#ffebee', color: '#c62828', label: 'DELETE' };
      default: return { bg: '#f5f5f5', color: '#666', label: method };
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} /> System Audit Logs
          </h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Tracking all structural modifications made by administrative users.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Shield size={48} color="#ddd" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>No logs yet</h3>
            <p style={{ color: '#888' }}>Administrative actions will be recorded here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' }}>TIMESTAMP</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' }}>ADMIN USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' }}>ACTION</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' }}>TARGET ENDPOINT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' }}>IP ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const action = getActionStyle(log.action_type);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eaeaea', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#555', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#999" /> {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} color="#4a90e2" /> {log.admin_username}
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      <span style={{ background: action.bg, color: action.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
                        {action.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'monospace', color: '#555', verticalAlign: 'middle', background: '#fafafa' }}>
                      {log.endpoint}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#777', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} color="#999" /> {log.ip_address}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
