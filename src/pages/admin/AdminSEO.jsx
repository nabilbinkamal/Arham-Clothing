import React, { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle, FileText, Globe, Save, Search, Sparkles } from 'lucide-react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';

const defaults = {
  seo_title: 'AUREON | Modern Fashion & Lifestyle',
  seo_description: 'Discover timeless fashion, premium essentials and modern lifestyle products from AUREON.',
  seo_keywords: 'fashion, clothing, lifestyle, online fashion Bangladesh',
  seo_author: 'AUREON',
  seo_canonical_url: '',
  seo_robots: 'index,follow',
  seo_og_title: '',
  seo_og_description: '',
  seo_og_image: '',
  seo_twitter_card: 'summary_large_image',
  gsc_verification_method: 'meta',
  gsc_verification_code: '',
  gsc_html_file_name: '',
  gsc_dns_record: ''
};

const cardStyle = { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#fafafa', border: '1px solid #ddd', color: '#333', borderRadius: '6px', fontSize: '14px', outline: 'none' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#333' };

const getKeywords = (value) => [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))];

const AdminSEO = () => {
  const [settings, setSettings] = useState(defaults);
  const [business, setBusiness] = useState('AUREON modern fashion Bangladesh');
  const [audience, setAudience] = useState('fashion-conscious shoppers');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestionMessage, setSuggestionMessage] = useState('');

  useEffect(() => {
    fetchWithAuth('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => setMessage('Could not load SEO settings.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const generateSuggestions = () => {
    const cleanBusiness = business.trim() || 'AUREON modern fashion Bangladesh';
    const cleanAudience = audience.trim() || 'fashion-conscious shoppers';
    const words = cleanBusiness.toLowerCase().split(/\s+/).filter(Boolean);
    const keywordList = getKeywords(`${cleanBusiness}, online fashion, premium clothing, Bangladesh, ${cleanAudience}`);
    const title = `${cleanBusiness.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} | Shop Online`;
    const description = `Shop ${words.slice(0, 4).join(' ')} for ${cleanAudience}. Explore quality products, easy ordering and nationwide delivery across Bangladesh.`;
    setSettings(prev => ({
      ...prev,
      seo_title: title.slice(0, 60),
      seo_description: description.slice(0, 160),
      seo_keywords: keywordList.join(', '),
      seo_og_title: title.slice(0, 60),
      seo_og_description: description.slice(0, 160)
    }));
    setSuggestionMessage('Suggestions generated. Review them before saving.');
  };

  const keywordCount = useMemo(() => getKeywords(settings.seo_keywords || '').length, [settings.seo_keywords]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Save failed');
      setMessage('SEO settings saved successfully.');
    } catch {
      setMessage('Could not save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout setAdminAuth={() => {}}><div style={{ padding: '24px' }}>Loading SEO settings...</div></AdminLayout>;

  return (
    <AdminLayout setAdminAuth={() => {}}>
      <div style={{ maxWidth: '980px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', display: 'flex', alignItems: 'center', gap: '10px' }}><Search size={26} /> SEO Manager</h2>
          <p style={{ color: '#666', marginTop: '6px' }}>Control how the website appears in Google and social sharing previews.</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section style={cardStyle}>
            <h3 style={{ fontSize: '18px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={20} /> AI SEO Assistant</h3>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: '18px' }}>Generates editable starter copy from your business and audience. Always review claims before publishing.</p>
            <div className="admin-two-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Business / main topic</label><input value={business} onChange={e => setBusiness(e.target.value)} style={inputStyle} placeholder="e.g. modest fashion Bangladesh" /></div>
              <div><label style={labelStyle}>Target audience</label><input value={audience} onChange={e => setAudience(e.target.value)} style={inputStyle} placeholder="e.g. young professionals" /></div>
            </div>
            <button type="button" onClick={generateSuggestions} style={{ marginTop: '18px', background: '#111', color: '#fff', border: 0, borderRadius: '6px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><Sparkles size={16} /> Generate suggestions</button>
            {suggestionMessage && <span style={{ marginLeft: '12px', color: '#2e7d32', fontSize: '13px' }}>{suggestionMessage}</span>}
          </section>

          <section style={cardStyle}>
            <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={20} /> Search engine metadata</h3>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div><label style={labelStyle}>SEO title <span style={{ color: '#888', fontWeight: 400 }}>({(settings.seo_title || '').length}/60)</span></label><input name="seo_title" value={settings.seo_title} onChange={update} maxLength={70} style={inputStyle} /></div>
              <div><label style={labelStyle}>Meta description <span style={{ color: '#888', fontWeight: 400 }}>({(settings.seo_description || '').length}/160)</span></label><textarea name="seo_description" value={settings.seo_description} onChange={update} maxLength={180} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div><label style={labelStyle}>Keywords ({keywordCount})</label><input name="seo_keywords" value={settings.seo_keywords} onChange={update} style={inputStyle} placeholder="fashion, clothing, Bangladesh" /><small style={{ color: '#888' }}>Comma-separated. Keywords are a supporting signal; useful content matters most.</small></div>
              <div className="admin-two-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}><div><label style={labelStyle}>Author / brand</label><input name="seo_author" value={settings.seo_author} onChange={update} style={inputStyle} /></div><div><label style={labelStyle}>Robots</label><select name="seo_robots" value={settings.seo_robots} onChange={update} style={inputStyle}><option value="index,follow">Index, follow</option><option value="noindex,follow">No index, follow</option><option value="index,nofollow">Index, nofollow</option><option value="noindex,nofollow">No index, nofollow</option></select></div></div>
              <div><label style={labelStyle}>Canonical URL</label><input name="seo_canonical_url" value={settings.seo_canonical_url} onChange={update} style={inputStyle} placeholder="https://yourdomain.com/" /><small style={{ color: '#888' }}>Use the final public domain, including https://.</small></div>
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><SharePreviewIcon /> Social preview tags</h3>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div><label style={labelStyle}>Open Graph title</label><input name="seo_og_title" value={settings.seo_og_title} onChange={update} maxLength={70} style={inputStyle} placeholder="Leave empty to use SEO title" /></div>
              <div><label style={labelStyle}>Open Graph description</label><textarea name="seo_og_description" value={settings.seo_og_description} onChange={update} maxLength={180} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Leave empty to use meta description" /></div>
              <div><label style={labelStyle}>Social share image URL</label><input name="seo_og_image" value={settings.seo_og_image} onChange={update} style={inputStyle} placeholder="https://yourdomain.com/og-image.jpg" /></div>
              <div><label style={labelStyle}>Twitter card</label><select name="seo_twitter_card" value={settings.seo_twitter_card} onChange={update} style={inputStyle}><option value="summary_large_image">Large image</option><option value="summary">Summary</option></select></div>
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={{ fontSize: '18px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={20} /> Google Search Console verification</h3>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: '18px' }}>Choose a method in Search Console, paste the value here, save, then click Verify in Google. Meta tag is the easiest option.</p>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div><label style={labelStyle}>Verification method</label><select name="gsc_verification_method" value={settings.gsc_verification_method} onChange={update} style={inputStyle}><option value="meta">HTML meta tag (recommended)</option><option value="dns">DNS TXT record</option><option value="html_file">HTML file upload</option></select></div>
              <div><label style={labelStyle}>Verification token / content</label><input name="gsc_verification_code" value={settings.gsc_verification_code} onChange={update} style={inputStyle} placeholder="Paste only the token/content from Google" /></div>
              {settings.gsc_verification_method === 'html_file' && <div><label style={labelStyle}>Google HTML file name</label><input name="gsc_html_file_name" value={settings.gsc_html_file_name} onChange={update} style={inputStyle} placeholder="google-site-verification-xxxx.html" /></div>}
              {settings.gsc_verification_method === 'dns' && <div><label style={labelStyle}>DNS TXT record (reference)</label><input name="gsc_dns_record" value={settings.gsc_dns_record} onChange={update} style={inputStyle} placeholder="google-site-verification=..." /></div>}
            </div>
            <div style={{ marginTop: '18px', padding: '14px', background: '#f7f9fc', borderRadius: '8px', fontSize: '12px', color: '#555' }}><FileText size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Sitemap URL: <strong>{(settings.seo_canonical_url || 'https://yourdomain.com').replace(/\/$/, '')}/sitemap.xml</strong><br />Robots URL: <strong>{(settings.seo_canonical_url || 'https://yourdomain.com').replace(/\/$/, '')}/robots.txt</strong></div>
          </section>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><button type="submit" disabled={saving} style={{ background: '#111', color: '#fff', border: 0, borderRadius: '6px', padding: '14px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}><Save size={18} /> {saving ? 'Saving...' : 'Save SEO settings'}</button>{message && <span style={{ color: message.includes('successfully') ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>{message}</span>}</div>
        </form>
      </div>
    </AdminLayout>
  );
};

const SharePreviewIcon = () => <span style={{ fontSize: '18px' }} aria-hidden="true">↗</span>;

export default AdminSEO;
