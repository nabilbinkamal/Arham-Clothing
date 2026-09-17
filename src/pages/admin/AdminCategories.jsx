import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Plus, Trash2, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

// Permanent structure — cannot be changed from admin
const MAIN_CATEGORIES = [
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
  { name: 'Kids', slug: 'kids' }
];

const SUB_CATEGORIES = {
  men: ['Tops', 'Bottoms', 'Winter'],
  women: ['Tops', 'Bottoms', 'Winter'],
  kids: ['Boys', 'Girls']
};

const AdminCategories = ({ setAdminAuth }) => {
  const [menuItems, setMenuItems] = useState([]);
  const { addToast } = useContext(ToastContext);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMainCat, setFormMainCat] = useState('');
  const [formSubCat, setFormSubCat] = useState('');
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetchWithAuth('/api/menu-items');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch menu items', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          main_category: formMainCat,
          sub_category: formSubCat,
          name: formName,
          slug: formSlug
        })
      });
      addToast('Menu item added successfully!', 'success');
      setFormMainCat(''); setFormSubCat(''); setFormName(''); setFormSlug('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to add menu item.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetchWithAuth(`/api/menu-items/${id}`, { method: 'DELETE' });
      addToast('Item deleted.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Error deleting item.', 'error');
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    setFormName(val);
    setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  // Get available sub categories based on selected main category
  const availableSubCats = formMainCat ? SUB_CATEGORIES[formMainCat] || [] : [];

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Category Management</h2>
            <p style={{ fontSize: '13px', color: '#888' }}>Main categories and sub-categories are permanent. You can add/remove items under each sub-category.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              <Plus size={16} /> Add Item
            </button>
          )}
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <strong>Add New Menu Item</strong>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <select value={formMainCat} onChange={e => { setFormMainCat(e.target.value); setFormSubCat(''); }} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="">Select Main Category</option>
                {MAIN_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <select value={formSubCat} onChange={e => setFormSubCat(e.target.value)} required disabled={!formMainCat} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="">Select Sub Category</option>
                {availableSubCats.map(sc => <option key={sc} value={sc.toLowerCase()}>{sc}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input type="text" placeholder="Item Name (e.g. T-Shirt)" value={formName} onChange={e => handleNameChange(e.target.value)} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              <input type="text" placeholder="Slug (auto-generated)" value={formSlug} onChange={e => setFormSlug(e.target.value)} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <button type="submit" style={{ background: '#111', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
          </form>
        )}

        {/* Category Tree View */}
        {MAIN_CATEGORIES.map(mainCat => {
          const subCats = SUB_CATEGORIES[mainCat.slug] || [];
          return (
            <div key={mainCat.slug} style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '8px' }}>
                {mainCat.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${subCats.length}, 1fr)`, gap: '24px' }}>
                {subCats.map(subCat => {
                  const items = menuItems.filter(
                    item => item.main_category === mainCat.slug && item.sub_category === subCat.toLowerCase()
                  );
                  return (
                    <div key={subCat}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                        {subCat}
                      </h4>
                      {items.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {items.map(item => (
                            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
                                <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '8px' }}>/{item.slug}</span>
                              </div>
                              <button onClick={() => handleDelete(item.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>No items yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
