import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Save } from 'lucide-react';
import ToggleSwitch from '../../components/ToggleSwitch';

const AdminSections = ({ setAdminAuth }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/homepage-sections')
      .then(res => res.json())
      .then(data => {
        setSections(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleTitleChange = (id, newTitle) => {
    setSections(sections.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const toggleActive = (id) => {
    setSections(sections.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    const tempOrder = newSections[index].display_order;
    newSections[index].display_order = newSections[index - 1].display_order;
    newSections[index - 1].display_order = tempOrder;
    newSections.sort((a, b) => a.display_order - b.display_order);
    setSections(newSections);
  };

  const moveDown = (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const tempOrder = newSections[index].display_order;
    newSections[index].display_order = newSections[index + 1].display_order;
    newSections[index + 1].display_order = tempOrder;
    newSections.sort((a, b) => a.display_order - b.display_order);
    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/homepage-sections', {
        method: 'PUT',
        body: JSON.stringify({ sections })
      });
      if (res.ok) {
        alert('Homepage sections updated successfully!');
      } else {
        alert('Failed to update sections');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving sections');
    }
    setSaving(false);
  };

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Homepage Layout</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Control the visibility, naming, and order of homepage sections.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', maxWidth: '800px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading sections...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-sections-grid" style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px', gap: '16px', padding: '0 16px', fontWeight: 'bold', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>
              <div>Order</div>
              <div>Section Title</div>
              <div style={{ textAlign: 'center' }}>Visible</div>
              <div style={{ textAlign: 'right' }}>Reorder</div>
            </div>

            {sections.map((section, index) => (
              <div className="admin-sections-grid" key={section.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px', gap: '16px', alignItems: 'center', background: '#fafafa', border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', color: '#111', fontSize: '16px', textAlign: 'center' }}>
                  {section.display_order}
                </div>
                <div>
                  <input 
                    type="text" 
                    value={section.title} 
                    onChange={(e) => handleTitleChange(section.id, e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontWeight: '600' }}
                  />
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>System Key: {section.section_key}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ToggleSwitch checked={Boolean(section.is_active)} label={`Toggle ${section.title}`} onChange={() => toggleActive(section.id)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button 
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    style={{ padding: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', background: 'white', border: '1px solid #ddd', borderRadius: '4px', opacity: index === 0 ? 0.5 : 1 }}
                  >
                    ▲
                  </button>
                  <button 
                    onClick={() => moveDown(index)}
                    disabled={index === sections.length - 1}
                    style={{ padding: '6px', cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer', background: 'white', border: '1px solid #ddd', borderRadius: '4px', opacity: index === sections.length - 1 ? 0.5 : 1 }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSections;
