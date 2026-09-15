import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Check, Inbox } from 'lucide-react';

const AdminMessages = ({ setAdminAuth }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = () => {
    fetchWithAuth('/api/admin/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetchWithAuth(`/api/admin/messages/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' })
      });
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Contact Messages</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#666' }}>
            <Inbox size={48} style={{ margin: '0 auto 16px auto', color: '#ccc' }} />
            No messages found.
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: msg.status === 'Unread' ? '4px solid #111' : '4px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{msg.subject || 'No Subject'}</h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                    From: <a href={`mailto:${msg.email}`} style={{ color: '#111', fontWeight: '600' }}>{msg.name} ({msg.email})</a>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px 0' }}>{new Date(msg.created_at).toLocaleString()}</p>
                  {msg.status === 'Unread' ? (
                    <button 
                      onClick={() => markAsRead(msg.id)}
                      style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Check size={14} /> Mark as Read
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Check size={14} /> Read
                    </span>
                  )}
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px', fontSize: '14px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
