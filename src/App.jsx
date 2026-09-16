import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useState, useEffect } from 'react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminLayout = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminLayout })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminFeatures = lazy(() => import('./pages/admin/AdminFeatures'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSliders = lazy(() => import('./pages/admin/AdminSliders'));
const AdminSections = lazy(() => import('./pages/admin/AdminSections'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminPolicies = lazy(() => import('./pages/admin/AdminPolicies'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
import PolicyPage from './pages/PolicyPage';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import TrackOrder from './pages/TrackOrder';
import PrintInvoice from './pages/PrintInvoice';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { WishlistProvider } from './context/WishlistContext';
import CartDrawer from './components/CartDrawer';
import AnnouncementBanner from './components/AnnouncementBanner';
import AnnouncementPopup from './components/AnnouncementPopup';
import SecurityEnforcer from './components/SecurityEnforcer';
import WhatsAppWidget from './components/WhatsAppWidget';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import CustomPage from './pages/CustomPage';
import './index.css';

const setMetaTag = (name, content, attribute = 'name') => {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setLinkTag = (rel, href) => {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
};

const getUsableCanonical = (value, fallback) => {
  if (!value || /localhost|127\.0\.0\.1/i.test(value)) return fallback;
  return value;
};

const SEOHead = ({ settings }) => {
  const location = useLocation();

  useEffect(() => {
    const seoTitle = settings.seo_title || 'Arham Clothing | Everyday Essentials';
    const seoDescription = settings.seo_description || 'Discover refined everyday essentials from Arham Clothing.';
    const configuredCanonical = settings.seo_canonical_url?.replace(/\/$/, '');
    const canonicalUrl = getUsableCanonical(configuredCanonical, `${window.location.origin}${location.pathname}`);
    document.title = seoTitle;
    setMetaTag('description', seoDescription);
    setMetaTag('robots', settings.seo_robots || 'index,follow');
    setLinkTag('canonical', canonicalUrl);
    setMetaTag('og:url', canonicalUrl, 'property');
    if (typeof window.fbq === 'function' && window.__arhamPixelPagePath !== location.pathname) {
      window.fbq('track', 'PageView');
      window.__arhamPixelPagePath = location.pathname;
    }
  }, [location.pathname, settings]);

  return null;
};

function App() {
  const [adminAuth, setAdminAuth] = useState(!!localStorage.getItem('adminToken'));
  const [publicSettings, setPublicSettings] = useState({});

  useEffect(() => {
    // Record visit if not already recorded in this session
    if (!sessionStorage.getItem('arham_visit_recorded')) {
      fetch('/api/track-visit', { method: 'POST' })
        .then(() => {
          sessionStorage.setItem('arham_visit_recorded', 'true');
        })
        .catch(err => console.error('Failed to log visit', err));
    }

    // Fetch global public settings (favicon)
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(settings => {
        setPublicSettings(settings);
        const seoTitle = settings.seo_title || 'Arham Clothing | Everyday Essentials';
        const seoDescription = settings.seo_description || 'Discover refined everyday essentials from Arham Clothing.';
        const canonicalUrl = getUsableCanonical(settings.seo_canonical_url, window.location.origin + window.location.pathname);
        document.title = seoTitle;
        setMetaTag('description', seoDescription);
        setMetaTag('keywords', settings.seo_keywords);
        setMetaTag('author', settings.seo_author || 'Arham Clothing');
        setMetaTag('robots', settings.seo_robots || 'index,follow');
        setLinkTag('canonical', canonicalUrl);
        setMetaTag('og:title', settings.seo_og_title || seoTitle, 'property');
        setMetaTag('og:description', settings.seo_og_description || seoDescription, 'property');
        setMetaTag('og:type', 'website', 'property');
        setMetaTag('og:url', canonicalUrl, 'property');
        if (settings.seo_og_image) setMetaTag('og:image', settings.seo_og_image, 'property');
        setMetaTag('twitter:card', settings.seo_twitter_card || 'summary_large_image');
        setMetaTag('twitter:title', settings.seo_og_title || seoTitle);
        setMetaTag('twitter:description', settings.seo_og_description || seoDescription);
        if (settings.seo_og_image) setMetaTag('twitter:image', settings.seo_og_image);
        if (settings.gsc_verification_method === 'meta' && settings.gsc_verification_code) {
          setMetaTag('google-site-verification', settings.gsc_verification_code);
        }
        let structuredData = document.head.querySelector('#arham-seo-jsonld');
        if (!structuredData) {
          structuredData = document.createElement('script');
          structuredData.id = 'arham-seo-jsonld';
          structuredData.type = 'application/ld+json';
          document.head.appendChild(structuredData);
        }
        structuredData.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: seoTitle, description: seoDescription, url: canonicalUrl });
        if (settings.favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = settings.favicon_url;
        }
        
        // Inject Meta Pixel if enabled
        if (settings.meta_pixel_active === '1' && settings.meta_pixel_id) {
          if (!window.fbq) {
            window.fbq = function (...args) {
              if (window.fbq.callMethod) {
                window.fbq.callMethod(...args);
              } else {
                window.fbq.queue.push(args);
              }
            };
            window._fbq = window.fbq;
            window.fbq.push = window.fbq;
            window.fbq.loaded = true;
            window.fbq.version = '2.0';
            window.fbq.queue = [];
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://connect.facebook.net/en_US/fbevents.js';
            document.head.appendChild(script);
            window.fbq('init', settings.meta_pixel_id);
            window.fbq('track', 'PageView');
            window.__arhamPixelPagePath = window.location.pathname;
          }
        }
        
        // Save settings to session storage for easy access by other components (Header, Footer)
        sessionStorage.setItem('publicSettings', JSON.stringify(settings));
      })
      .catch(err => console.error('Failed to load public settings', err));
  }, []);
  
  return (
    <UserProvider>
      <ToastProvider>
        <WishlistProvider>
        <CartProvider>
          <SecurityEnforcer />
          <Router>
          <SEOHead settings={publicSettings} />
          <AnnouncementBanner />
          <CartDrawer />
          <WhatsAppWidget />
          <Suspense fallback={<div className="route-loading" role="status">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/invoice/:id" element={<PrintInvoice />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/stores" element={<CustomPage pageKey="stores" />} />
            <Route path="/corporate" element={<CustomPage pageKey="corporate" />} />
            <Route path="/careers" element={<CustomPage pageKey="careers" />} />
            <Route path="/privacy-policy" element={<PolicyPage policyKey="privacy-policy" />} />
            <Route path="/refund-policy" element={<PolicyPage policyKey="refund-policy" />} />
            <Route path="/terms-of-service" element={<PolicyPage policyKey="terms-of-service" />} />

            {/* Admin Routes */}
            <Route path="/admin" element={adminAuth ? <Navigate to="/admin/dashboard" /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/login" element={<AdminLogin setAdminAuth={setAdminAuth} />} />
            <Route path="/admin/dashboard" element={adminAuth ? <AdminDashboard setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/products" element={adminAuth ? <AdminProducts setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/categories" element={adminAuth ? <AdminCategories setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/features" element={adminAuth ? <AdminFeatures setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/announcements" element={adminAuth ? <AdminAnnouncements setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/orders" element={adminAuth ? <AdminOrders setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/sliders" element={adminAuth ? <AdminSliders setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/layout" element={adminAuth ? <AdminLayout setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/sections" element={adminAuth ? <AdminSections setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/settings" element={adminAuth ? <AdminSettings setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />

            <Route path="/admin/users" element={adminAuth ? <AdminUsers setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/customers" element={adminAuth ? <AdminCustomers setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/policies" element={adminAuth ? <AdminPolicies setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/pages" element={adminAuth ? <AdminPages setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
            <Route path="/admin/messages" element={adminAuth ? <AdminMessages setAdminAuth={setAdminAuth} /> : <Navigate to="/admin/login" />} />
          </Routes>
          </Suspense>
          <AnnouncementPopup />
        </Router>
        </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
