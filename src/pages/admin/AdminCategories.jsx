import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Plus, Trash2, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

const AdminCategories = ({ setAdminAuth }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const { addToast } = useContext(ToastContext);
  
  // Form states
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  const [showSubForm, setShowSubForm] = useState(false);
  const [subCatId, setSubCatId] = useState('');
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');

  const fetchData = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetchWithAuth('/api/categories'),
        fetchWithAuth('/api/subcategories')
      ]);
      setCategories(await catRes.json());
      setSubcategories(await subRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, slug: catSlug })
      });
      addToast('Category saved successfully!', 'success');
      setCatName(''); setCatSlug(''); setShowCatForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Delete this category? This might delete associated subcategories.')) return;
    try {
      await fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' });
      addToast('Category deleted.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Error deleting category.', 'error');
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: subCatId, name: subName, slug: subSlug })
      });
      addToast('Subcategory saved successfully!', 'success');
      setSubCatId(''); setSubName(''); setSubSlug(''); setShowSubForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to save subcategory.', 'error');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if(!window.confirm('Delete this subcategory?')) return;
    try {
      await fetchWithAuth(`/api/subcategories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', gap: '32px' }}>
        
        {/* Categories Section */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Categories</h2>
            {!showCatForm && (
              <button 
                onClick={() => setShowCatForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={16} /> Add Category
              </button>
            )}
          </div>

          {showCatForm && (
            <form onSubmit={handleAddCategory} style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <strong>New Category</strong>
                <button type="button" onClick={() => setShowCatForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <input type="text" placeholder="Category Name (e.g. Mens)" value={catName} onChange={e => setCatName(e.target.value)} required style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd' }} />
              <input type="text" placeholder="Slug (e.g. mens)" value={catSlug} onChange={e => setCatSlug(e.target.value)} required style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ddd' }} />
              <button type="submit" style={{ background: '#111', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>Save</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '16px' }}>
            {categories.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Slug: {c.slug}</div>
                </div>
                <button onClick={() => handleDeleteCategory(c.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && <div style={{ color: '#888', fontSize: '14px' }}>No categories found.</div>}
          </div>
        </div>

        {/* Subcategories Section */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Subcategories</h2>
            {!showSubForm && (
              <button 
                onClick={() => setShowSubForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={16} /> Add Subcategory
              </button>
            )}
          </div>

          {showSubForm && (
            <form onSubmit={handleAddSubcategory} style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <strong>New Subcategory</strong>
                <button type="button" onClick={() => setShowSubForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <select value={subCatId} onChange={e => setSubCatId(e.target.value)} required style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd' }}>
                <option value="">Select Parent Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Subcategory Name (e.g. Shirts)" value={subName} onChange={e => setSubName(e.target.value)} required style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd' }} />
              <input type="text" placeholder="Slug (e.g. shirts)" value={subSlug} onChange={e => setSubSlug(e.target.value)} required style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ddd' }} />
              <button type="submit" style={{ background: '#111', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>Save</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '16px' }}>
            {subcategories.map(s => {
              const parentCat = categories.find(c => c.id === s.category_id);
              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Parent: {parentCat?.name} | Slug: {s.slug}</div>
                  </div>
                  <button onClick={() => handleDeleteSubcategory(s.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            {subcategories.length === 0 && <div style={{ color: '#888', fontSize: '14px' }}>No subcategories found.</div>}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
