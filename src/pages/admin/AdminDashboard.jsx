import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, LogOut, LayoutDashboard, Home, Settings, List, Star, Megaphone, Image, Users, FileText, Mail, FileOutput, X, TrendingUp, ShoppingBag, Box, ArrowRight, Search, ShieldAlert, Layers, ClipboardList, Shield, Database, TerminalSquare } from 'lucide-react';
import Logo from '../../components/Logo';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AdminLayout = ({ children, setAdminAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getAdminRole = () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return 'Admin';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'Admin';
    } catch {
      return 'Admin';
    }
  };
  const role = getAdminRole();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminAuth(false);
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '250px', background: '#111', color: 'white', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <Logo color="white" size={20} />
          </Link>
          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginTop: '8px' }}>Admin Panel</span>
        </div>
        
        <nav style={{ flex: 1, padding: '0 16px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* STORE SECTION (Admin, Manager) */}
            {(role === 'Admin' || role === 'Manager') && (
              <>
                <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '8px 16px', fontWeight: 'bold' }}>Store</span>
                <li>
                  <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/dashboard' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/dashboard' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Home size={18} /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/orders' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/orders' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Package size={18} /> Orders
                  </Link>
                </li>
                <li>
                  <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/products' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/products' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <ShoppingBag size={18} /> Products
                  </Link>
                </li>
                <li>
                  <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/categories' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/categories' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <List size={18} /> Categories
                  </Link>
                </li>
                <li>
                  <Link to="/admin/customers" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/customers' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/customers' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Users size={18} /> Customers
                  </Link>
                </li>
              </>
            )}

            {/* CMS SECTION (Admin, Editor) */}
            {(role === 'Admin' || role === 'Editor') && (
              <>
                <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '24px 16px 8px', fontWeight: 'bold' }}>CMS</span>
                <li>
                  <Link to="/admin/sliders" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/sliders' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/sliders' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Image size={18} /> Sliders
                  </Link>
                </li>
                <li>
                  <Link to="/admin/features" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/features' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/features' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Star size={18} /> Features
                  </Link>
                </li>
                <li>
                  <Link to="/admin/announcements" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/announcements' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/announcements' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Megaphone size={18} /> Announcements
                  </Link>
                </li>
              </>
            )}

            {/* SYSTEM SECTION (Admin Only) */}
            {role === 'Admin' && (
              <>
                <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '24px 16px 8px', fontWeight: 'bold' }}>System</span>
                <li>
                  <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/users' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/users' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Users size={18} /> Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: location.pathname === '/admin/settings' ? 'white' : '#999', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: location.pathname === '/admin/settings' ? '#333' : 'transparent', transition: 'all 0.2s', fontSize: '14px' }}>
                    <Settings size={18} /> Settings
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div style={{ padding: '0 24px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, onClick, color }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontSize: '13px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{title}</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111' }}>{value}</p>
      </div>
      <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '50%' }}>
        {icon}
      </div>
    </div>
    <button onClick={onClick} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      View Details <ArrowRight size={14} />
    </button>
  </div>
);

const AdminDashboard = ({ setAdminAuth }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'revenue', 'visits', 'orders', 'products'
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    fetchWithAuth('/api/analytics')
      .then(res => res.json())
      .then(analytics => {
        if (analytics.graphData) {
          analytics.graphData = analytics.graphData.map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));
        }
        setData(analytics);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetchWithAuth('/api/admin/storage')
      .then(res => res.json())
      .then(data => setStorage(data))
      .catch(err => console.error(err));
  }, []);

  const renderModal = () => {
    if (!activeModal || !data) return null;
    
    let content = null;
    
    if (activeModal === 'revenue') {
      content = (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Revenue Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Today</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৳{data.revenue.today.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>This Week</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৳{data.revenue.weekly.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>This Month</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৳{data.revenue.monthly.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>This Year</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৳{data.revenue.yearly.toLocaleString()}</p>
            </div>
          </div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Revenue Trend (Last 30 Days)</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888" tickFormatter={(v)=>`৳${v}`} />
                <RechartsTooltip formatter={(v) => [`৳${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (activeModal === 'visits') {
      content = (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Visitor Analytics (Unique IPs)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Today</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.visits.today.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>This Week</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.visits.weekly.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>This Month</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.visits.monthly.toLocaleString()}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>All Time</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.visits.allTime.toLocaleString()}</p>
            </div>
          </div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Visit Trend (Last 30 Days)</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                <RechartsTooltip />
                <Area type="monotone" dataKey="visits" stroke="#111" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (activeModal === 'orders') {
      content = (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Orders Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #111' }}>
              <p style={{ fontSize: '12px', color: '#111', textTransform: 'uppercase', fontWeight: 'bold' }}>Delivered</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{data.orders.success}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #555' }}>
              <p style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{data.orders.pending}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #333' }}>
              <p style={{ fontSize: '12px', color: '#333', textTransform: 'uppercase', fontWeight: 'bold' }}>Processing/Shipped</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{data.orders.processing + data.orders.shipped}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #888' }}>
              <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Cancelled</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{data.orders.cancelled}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #aaa' }}>
              <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold' }}>Refunded</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{data.orders.refunded}</p>
            </div>
          </div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Orders Trend (Last 30 Days)</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                <RechartsTooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="orders" fill="#111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else if (activeModal === 'products') {
      content = (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Products by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {data.products.byCategory.map((cat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600' }}>{cat.category}</span>
                <span style={{ background: '#111', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {cat.count} Items
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
        <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '16px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.2s ease-out forwards' }}>
          <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', cursor: 'pointer', padding: '8px', background: '#f5f5f5', borderRadius: '50%' }}>
            <X size={20} color="#666" />
          </button>
          {content}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Dashboard Overview</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>
      
      {loading || !data ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading advanced analytics...</div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <MetricCard 
              title="Total Revenue" 
              value={`৳${data.revenue.allTime.toLocaleString()}`} 
              icon={<TrendingUp size={24} />} 
              color="#111" 
              onClick={() => setActiveModal('revenue')} 
            />
            <MetricCard 
              title="Total Visits" 
              value={data.visits.allTime.toLocaleString()} 
              icon={<Users size={24} />} 
              color="#111" 
              onClick={() => setActiveModal('visits')} 
            />
            <MetricCard 
              title="Total Orders" 
              value={data.orders.total.toLocaleString()} 
              icon={<ShoppingBag size={24} />} 
              color="#111" 
              onClick={() => setActiveModal('orders')} 
            />
            <MetricCard 
              title="Total Products" 
              value={data.products.total.toLocaleString()} 
              icon={<Box size={24} />} 
              color="#111" 
              onClick={() => setActiveModal('products')} 
            />
          </div>
          
          {/* Main Charts */}
          <div className="admin-grid-2fr-1fr" style={{ display: 'grid', gap: '24px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Revenue vs Orders (Last 30 Days)</h3>
              </div>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="date" stroke="#999" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis yAxisId="left" stroke="#999" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v)=>`৳${v}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#111" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#888" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#111', fontWeight: '600', transition: 'background 0.2s' }}>
                    <div style={{ background: '#eee', padding: '10px', borderRadius: '8px', color: '#111' }}><Box size={20} /></div>
                    <div style={{ flex: 1 }}>Manage Products</div>
                    <ArrowRight size={16} color="#888" />
                  </Link>
                  <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#111', fontWeight: '600', transition: 'background 0.2s' }}>
                    <div style={{ background: '#eee', padding: '10px', borderRadius: '8px', color: '#111' }}><ShoppingBag size={20} /></div>
                    <div style={{ flex: 1 }}>Process Orders</div>
                    <ArrowRight size={16} color="#888" />
                  </Link>
                  <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#111', fontWeight: '600', transition: 'background 0.2s' }}>
                    <div style={{ background: '#eee', padding: '10px', borderRadius: '8px', color: '#111' }}><List size={20} /></div>
                    <div style={{ flex: 1 }}>Edit Categories</div>
                    <ArrowRight size={16} color="#888" />
                  </Link>
                </div>
              </div>

              {storage && (
                <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={20} /> Storage Monitor
                  </h3>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      <span>Used: {(storage.used / (1024*1024*1024)).toFixed(2)} GB</span>
                      <span>Total: {(storage.total / (1024*1024*1024)).toFixed(2)} GB</span>
                    </div>
                    <div style={{ height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${storage.percentage}%`, background: storage.percentage > 80 ? '#ff6b6b' : '#111', borderRadius: '6px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', fontSize: '12px', color: '#666', fontWeight: '500' }}>
                      Free Space: {(storage.free / (1024*1024*1024)).toFixed(2)} GB ({ (100 - parseFloat(storage.percentage)).toFixed(1) }%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {renderModal()}
          
          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </AdminLayout>
  );
};

export { AdminLayout, AdminDashboard };
