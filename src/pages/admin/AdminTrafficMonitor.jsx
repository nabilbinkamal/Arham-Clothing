import React, { useCallback, useEffect, useState } from 'react';
import { Activity, ShieldAlert, Wifi, RefreshCw } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';

const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined) return 'Unavailable';
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 2 : 0)} ${units[index]}`;
};

const Stat = ({ label, value, color = '#111', icon }) => (
  <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ color, background: `${color}12`, borderRadius: '10px', padding: '10px' }}>{icon}</div>
    <div><p style={{ margin: 0, color: '#777', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.6px' }}>{label}</p><strong style={{ display: 'block', marginTop: '5px', fontSize: '22px' }}>{value}</strong></div>
  </div>
);

const AdminTrafficMonitor = ({ setAdminAuth }) => {
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMonitor = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/admin/traffic-monitor');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load traffic monitor');
      setMonitor(data); setError('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMonitor(); const timer = setInterval(loadMonitor, 10000); return () => clearInterval(timer); }, [loadMonitor]);

  return <AdminLayout setAdminAuth={setAdminAuth}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
      <div><h2 style={{ margin: 0, fontSize: '28px' }}>Bandwidth & DDoS Monitor</h2><p style={{ color: '#666', marginTop: '6px' }}>Live application traffic and origin-server protection signals.</p></div>
      <button type="button" onClick={loadMonitor} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontWeight: '600' }}><RefreshCw size={16} /> Refresh</button>
    </div>
    {loading && !monitor ? <div style={{ padding: '40px', textAlign: 'center', color: '#777' }}>Loading traffic monitor...</div> : error ? <div style={{ padding: '20px', background: '#ffebee', color: '#b71c1c', borderRadius: '10px' }}>{error}</div> : monitor && <>
      <div style={{ padding: '18px 20px', borderRadius: '12px', marginBottom: '22px', background: monitor.ddosDetected ? '#ffebee' : monitor.threatLevel === 'elevated' ? '#fff8e1' : '#e8f5e9', color: monitor.ddosDetected ? '#b71c1c' : monitor.threatLevel === 'elevated' ? '#8d6e00' : '#1b5e20', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid currentColor' }}>
        <ShieldAlert size={24} /><div><strong>{monitor.ddosDetected ? 'Possible DDoS / traffic spike detected' : `Threat level: ${monitor.threatLevel}`}</strong><div style={{ fontSize: '12px', marginTop: '3px' }}>Heuristic status from the last minute; volumetric attacks must also be checked in Cloudflare/WAF.</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <Stat label="Requests / minute" value={monitor.requests.lastMinute.toLocaleString()} color="#1877f2" icon={<Activity size={20} />} />
        <Stat label="Requests / 5 minutes" value={monitor.requests.lastFiveMinutes.toLocaleString()} icon={<Activity size={20} />} />
        <Stat label="Errors / minute" value={monitor.errors.lastMinute.toLocaleString()} color="#d84315" icon={<ShieldAlert size={20} />} />
        <Stat label="Rate limited / minute" value={monitor.errors.rateLimitedLastMinute.toLocaleString()} color="#8e24aa" icon={<ShieldAlert size={20} />} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
        <section style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '22px' }}><h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Wifi size={19} /> Bandwidth usage</h3><p>Application received: <strong>{formatBytes(monitor.bandwidth.applicationRequestBytes)}</strong></p><p>Application sent: <strong>{formatBytes(monitor.bandwidth.applicationResponseBytes)}</strong></p><p>Server received: <strong>{formatBytes(monitor.bandwidth.serverReceivedBytes)}</strong></p><p>Server sent: <strong>{formatBytes(monitor.bandwidth.serverSentBytes)}</strong></p></section>
        <section style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '22px' }}><h3 style={{ marginTop: 0 }}>Top request IPs</h3>{monitor.topIps.length ? monitor.topIps.map(item => <div key={item.ip} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}><span>{item.ip}</span><strong>{item.requests}</strong></div>) : <p style={{ color: '#777' }}>No traffic recorded yet.</p>}</section>
      </div>
      <p style={{ color: '#888', fontSize: '12px', marginTop: '18px' }}>{monitor.note}</p>
    </>}
  </AdminLayout>;
};

export default AdminTrafficMonitor;
