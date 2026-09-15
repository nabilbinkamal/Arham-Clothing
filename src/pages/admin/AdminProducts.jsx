import { fetchWithAuth } from '../../utils/api';
import ToggleSwitch from '../../components/ToggleSwitch';
import React, { useState, useEffect, useContext } from 'react';
import { AdminLayout } from './AdminDashboard';
import { Plus, Trash2, Edit2, X, Copy, Save, Download } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

const safeJsonParse = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data !== 'string') return data;
  try {
    let parsed = JSON.parse(data);
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const AdminProducts = ({ setAdminAuth }) => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [stock, setStock] = useState('0');
  const [description, setDescription] = useState('');
  const [isSale, setIsSale] = useState(false);
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [galleryUrls, setGalleryUrls] = useState('');
  
  // Specifications (bullet points)
  const [specifications, setSpecifications] = useState([]);
  const [newSpec, setNewSpec] = useState('');
  
  // Size Chart
  const [sizeChartHeaders, setSizeChartHeaders] = useState(['Size']);
  const [sizeChartRows, setSizeChartRows] = useState([]);
  const [newHeader, setNewHeader] = useState('');

  // Gallery file uploads
  const [galleryFiles, setGalleryFiles] = useState([]);
  
  const { addToast } = useContext(ToastContext);

  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  
  const fetchProducts = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/categories'),
        fetchWithAuth('/api/subcategories')
      ]);
      setProducts(await prodRes.json());
      setDbCategories(await catRes.json());
      setDbSubcategories(await subRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setTitle(''); setPrice(''); setOldPrice(''); setCategory(''); setSubcategory('');
    setSizes(''); setStock('0'); setDescription(''); setIsSale(false); setTags(''); setImage(null); setGalleryUrls('');
    setSpecifications([]); setNewSpec('');
    setSizeChartHeaders(['Size']); setSizeChartRows([]); setNewHeader('');
    setGalleryFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (p) => {
    setTitle(p.title);
    setPrice(p.price);
    setOldPrice(p.oldPrice || '');
    setCategory(p.category || '');
    setSubcategory(p.subcategory || '');
    setStock(p.stock || '0');
    setDescription(p.description || '');
    setIsSale(p.isSale);
    setTags(p.tags || '');
    // Load existing gallery URLs for display (uploaded files paths go here too)
    setGalleryUrls(p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery).join('\n') : p.gallery.join('\n')) : '');
    setGalleryFiles([]); // clear new files on edit load
    
    const sz = safeJsonParse(p.sizes, []);
    setSizes(Array.isArray(sz) ? sz.join(', ') : '');

    // Load specs
    const specs = safeJsonParse(p.specifications, []);
    setSpecifications(Array.isArray(specs) ? specs : []);

    // Load size chart
    const chart = safeJsonParse(p.size_chart, null);
    if (chart && chart.headers) { 
      setSizeChartHeaders(chart.headers); 
      setSizeChartRows(chart.rows || []); 
    }
    else { 
      setSizeChartHeaders(['Size']); 
      setSizeChartRows([]); 
    }
    setEditingId(p.id);
    setImage(null);
    setShowForm(true);
  };

  const handleDuplicateClick = (p) => {
    handleEditClick(p);
    setEditingId(null);
    addToast('Product copied! You can now save it as a new product.', 'success');
  };

  const savePreset = () => {
    const preset = { title, price, oldPrice, category, subcategory, sizes, stock, description, isSale, tags, galleryUrls, specifications, sizeChartHeaders, sizeChartRows };
    localStorage.setItem('productPreset', JSON.stringify(preset));
    addToast('Form fields saved as preset!', 'success');
  };

  const loadPreset = () => {
    const presetStr = localStorage.getItem('productPreset');
    if (presetStr) {
      try {
        const p = JSON.parse(presetStr);
        setTitle(p.title || ''); setPrice(p.price || ''); setOldPrice(p.oldPrice || ''); setCategory(p.category || '');
        setSubcategory(p.subcategory || ''); setSizes(p.sizes || ''); setStock(p.stock || '0'); setDescription(p.description || '');
        setIsSale(p.isSale || false); setTags(p.tags || ''); setGalleryUrls(p.galleryUrls || '');
        setSpecifications(p.specifications || []); setSizeChartHeaders(p.sizeChartHeaders || ['Size']); setSizeChartRows(p.sizeChartRows || []);
        addToast('Preset loaded!', 'success');
      } catch (e) { addToast('Failed to load preset', 'error'); }
    } else {
      addToast('No preset found', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('oldPrice', oldPrice);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    
    // Process sizes string (e.g. "S, M, L, XL" or "40,41") into JSON string array
    const sizesArray = sizes.split(',').map(s => s.trim()).filter(s => s !== '');
    formData.append('sizes', JSON.stringify(sizesArray));
    
    formData.append('stock', stock);
    formData.append('description', description);
    formData.append('isSale', isSale);
    formData.append('tags', tags);
    
    const galleryArray = galleryUrls.split('\n').map(s => s.trim()).filter(s => s !== '');
    formData.append('galleryUrls', galleryArray.join('\n'));

    if (image) formData.append('image', image);
    // Append gallery image files
    galleryFiles.forEach(f => formData.append('galleryImages', f));
    // Append specs and size chart
    let finalSpecs = [...specifications];
    if (newSpec.trim()) { finalSpecs.push(newSpec.trim()); }
    formData.append('specifications', JSON.stringify(finalSpecs));

    let finalSizeChartHeaders = [...sizeChartHeaders];
    let finalSizeChartRows = [...sizeChartRows];
    if (newHeader.trim() && !finalSizeChartHeaders.includes(newHeader.trim())) {
      finalSizeChartHeaders.push(newHeader.trim());
      finalSizeChartRows = finalSizeChartRows.map(row => [...row, '']);
    }
    const sizeChart = { headers: finalSizeChartHeaders, rows: finalSizeChartRows };
    formData.append('size_chart', JSON.stringify(sizeChart));

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, { method, body: formData });
      
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch(e) {}
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      addToast(editingId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      addToast(err.message || 'Failed to save product.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' });
      addToast('Product deleted successfully!', 'success');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete', err);
      addToast('Failed to delete product.', 'error');
    }
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manage Products</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="button" onClick={savePreset} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}><Save size={14}/> Save Preset</button>
              <button type="button" onClick={loadPreset} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f3e5f5', color: '#6a1b9a', border: '1px solid #e1bee7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}><Download size={14}/> Load Preset</button>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
          </div>
          
          <form className="admin-product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Product Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Price (৳)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Old Price (৳ - Optional)</label>
              <input type="number" value={oldPrice} onChange={e => setOldPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Category</label>
              <select value={category} onChange={e => {setCategory(e.target.value); setSubcategory('');}} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">Select Category</option>
                {dbCategories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Subcategory</label>
              <select value={subcategory} onChange={e => setSubcategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">Select Subcategory</option>
                {dbSubcategories.filter(s => {
                  const cat = dbCategories.find(c => c.slug === category);
                  return cat && s.category_id === cat.id;
                }).map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Available Sizes (comma-separated)</label>
              <input type="text" placeholder="e.g. S, M, L, XL or 40, 42" value={sizes} onChange={e => setSizes(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Stock Quantity</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Custom Tags (comma-separated)</label>
              <input type="text" placeholder="e.g. NEW, BESTSELLER, HOT" value={tags} onChange={e => setTags(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: '#f0f0f0', padding: '12px', borderRadius: '4px', display: 'inline-flex' }}>
                <ToggleSwitch checked={isSale} label="Toggle product sale badge" onChange={setIsSale} />
                On Sale (Shows SALE tag)
              </label>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Product Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} placeholder="Enter detailed product description..."></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Primary Product Image {editingId && '(Leave blank to keep existing)'}</label>
              <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" required={!editingId} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            
            <div style={{ gridColumn: 'span 2', background: '#f9f9f9', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🖼️ Additional Gallery Images</label>
              
              {/* File upload */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555', fontWeight: '600' }}>Upload Image Files (up to 10)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={e => setGalleryFiles(Array.from(e.target.files))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }} 
                />
                {galleryFiles.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {galleryFiles.map((f, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(f)} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '2px solid #111' }} />
                        <button type="button" onClick={() => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OR paste URLs */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555', fontWeight: '600' }}>OR Paste Image URLs (one per line)</label>
                <textarea value={galleryUrls} onChange={e => setGalleryUrls(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical', fontSize: '13px' }} placeholder={`https://example.com/image2.jpg\nhttps://example.com/image3.jpg`}></textarea>
              </div>

              {/* Preview existing saved gallery */}
              {galleryUrls && galleryUrls.split('\n').filter(u => u.trim()).length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Saved gallery ({galleryUrls.split('\n').filter(u => u.trim()).length} images)</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {galleryUrls.split('\n').filter(u => u.trim()).map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '2px solid #eee' }} />
                        <button type="button" onClick={() => { const lines = galleryUrls.split('\n').filter(u => u.trim()); lines.splice(i, 1); setGalleryUrls(lines.join('\n')); }}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToggleSwitch checked={isSale} label="Toggle product sale badge" onChange={setIsSale} />
              <label htmlFor="isSale" style={{ fontSize: '14px' }}>Show "SALE" badge on this product</label>
            </div>

            {/* Specifications Builder */}
            <div style={{ gridColumn: 'span 2', background: '#f9f9f9', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Detailed Specifications (Bullet Points)</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={newSpec}
                  onChange={e => setNewSpec(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSpec.trim()) { setSpecifications([...specifications, newSpec.trim()]); setNewSpec(''); } } }}
                  placeholder="e.g. 100% Cotton, Machine Washable..."
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                />
                <button type="button" onClick={() => { if (newSpec.trim()) { setSpecifications([...specifications, newSpec.trim()]); setNewSpec(''); } }}
                  style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 18px', cursor: 'pointer', fontWeight: '700' }}>
                  + Add
                </button>
              </div>
              {specifications.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {specifications.map((spec, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fff', borderRadius: '4px', marginBottom: '6px', border: '1px solid #eee', fontSize: '13px' }}>
                      <span style={{ flex: 1 }}>• {spec}</span>
                      <button type="button" onClick={() => setSpecifications(specifications.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Size Chart Builder */}
            <div style={{ gridColumn: 'span 2', background: '#f9f9f9', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📏 Size Chart Builder</h3>
              
              {/* Column Headers */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>COLUMNS (first column is always "Size")</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {sizeChartHeaders.map((h, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                      {h}
                      {i > 0 && (
                        <button type="button" onClick={() => {
                          const newHeaders = sizeChartHeaders.filter((_, idx) => idx !== i);
                          const newRows = sizeChartRows.map(r => r.filter((_, idx) => idx !== i));
                          setSizeChartHeaders(newHeaders); setSizeChartRows(newRows);
                        }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={newHeader} onChange={e => setNewHeader(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newHeader.trim()) { setSizeChartHeaders([...sizeChartHeaders, newHeader.trim()]); setSizeChartRows(sizeChartRows.map(r => [...r, ''])); setNewHeader(''); } } }}
                    placeholder="e.g. Chest, Length, Waist..."
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                  <button type="button" onClick={() => { if (newHeader.trim()) { setSizeChartHeaders([...sizeChartHeaders, newHeader.trim()]); setSizeChartRows(sizeChartRows.map(r => [...r, ''])); setNewHeader(''); } }}
                    style={{ background: '#555', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                    + Col
                  </button>
                </div>
              </div>

              {/* Rows */}
              {sizeChartHeaders.length > 1 && (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '10px' }}>
                      <thead>
                        <tr>{sizeChartHeaders.map((h, i) => (
                          <th key={i} style={{ padding: '8px 12px', background: '#111', color: '#fff', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}<th style={{ background: '#111', color: '#fff', padding: '8px' }}></th></tr>
                      </thead>
                      <tbody>
                        {sizeChartRows.map((row, ri) => (
                          <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                            {sizeChartHeaders.map((_, ci) => (
                              <td key={ci} style={{ padding: '4px 8px' }}>
                                <input type="text" value={row[ci] || ''}
                                  onChange={e => { const updated = sizeChartRows.map((r, rIdx) => rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? e.target.value : c) : r); setSizeChartRows(updated); }}
                                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minWidth: '70px' }}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '4px 8px' }}>
                              <button type="button" onClick={() => setSizeChartRows(sizeChartRows.filter((_, idx) => idx !== ri))}
                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}>×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={() => setSizeChartRows([...sizeChartRows, Array(sizeChartHeaders.length).fill('')])}
                    style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                    + Add Row
                  </button>
                </>
              )}
            </div>
            
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
              <button type="submit" style={{ background: '#111', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Image</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Title</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Price</th>
              <th style={{ padding: '16px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No products found. Add some!</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px' }}>
                    <img src={p.imageUrl || 'https://via.placeholder.com/50'} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    {p.title} {p.isSale && <span style={{ background: '#C0392B', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '2px', marginLeft: '8px' }}>SALE</span>}
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      {p.category} {p.subcategory && `> ${p.subcategory}`}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: p.stock > 10 ? '#e8f5e9' : p.stock > 0 ? '#fff3e0' : '#ffebee',
                      color: p.stock > 10 ? '#2e7d32' : p.stock > 0 ? '#e65100' : '#c62828'
                    }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>৳{p.price}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleDuplicateClick(p)} style={{ color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Duplicate">
                        <Copy size={18} />
                      </button>
                      <button onClick={() => handleEditClick(p)} style={{ color: '#3498DB', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
