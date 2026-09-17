require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

// Database Connection Pool Mock for SQLite
const pool = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (sql.includes('ON DUPLICATE KEY UPDATE')) {
         if (sql.includes('settings')) {
            sql = sql.replace('ON DUPLICATE KEY UPDATE setting_value = ?', 'ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?');
         } else if (sql.includes('users')) {
            sql = sql.replace('ON DUPLICATE KEY UPDATE role="Admin", name=VALUES(name), photo_url=VALUES(photo_url)', 'ON CONFLICT(uid) DO UPDATE SET role="Admin", name=excluded.name, photo_url=excluded.photo_url');
         }
      }
      if (sql.includes('INSERT IGNORE')) {
         sql = sql.replace('INSERT IGNORE', 'INSERT OR IGNORE');
      }

      // Convert MySQL date functions to SQLite
      if (sql.includes('CURDATE()')) {
         sql = sql.replace(/CURDATE\(\)/g, "date('now')");
      }
      if (sql.includes('DATE_SUB')) {
         sql = sql.replace(/DATE_SUB\(date\('now'\),\s*INTERVAL\s*(\d+)\s*DAY\)/g, "date('now', '-$1 days')");
      }
      
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('SHOW');
      
      if (isSelect) {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows]);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        });
      }
    });
  },
  getConnection: async () => ({
    query: (...args) => pool.query(...args),
    release: () => {}
  })
};
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { exec } = require('child_process');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '153863255352-1j7f1101crbnj52begmg9h2mpcolahot.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

/**
 * Verify Google Token (Supports both accessToken from GIS OAuth2 and idToken)
 */
async function verifyGoogleToken({ accessToken, idToken }) {
  if (accessToken) {
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
    if (!tokenInfoRes.ok) {
      throw new Error('Invalid or expired Google access token');
    }
    const tokenInfo = await tokenInfoRes.json();

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID && tokenInfo.issued_to !== GOOGLE_CLIENT_ID) {
      console.warn('Google client ID mismatch:', tokenInfo.aud || tokenInfo.issued_to, 'expected:', GOOGLE_CLIENT_ID);
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!userInfoRes.ok) {
      throw new Error('Failed to fetch Google user profile');
    }
    const profile = await userInfoRes.json();
    return {
      uid: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture
    };
  }

  if (idToken) {
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!tokenInfoRes.ok) {
      throw new Error('Invalid or expired Google ID token');
    }
    const payload = await tokenInfoRes.json();
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  }

  throw new Error('No Google token provided');
}

const JWT_SECRET = process.env.JWT_SECRET || 'arham-super-secret-key-2026-fallback';

const app = express();
const PORT = process.env.PORT || 5000;

const slugify = (value) => {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 220);
  return slug || 'product';
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1); // Trust first proxy (Nginx)

// Global XSS Sanitization Middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeStr = (str) => typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
    const sanitizeObj = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeStr(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key]);
        }
      }
    };
    sanitizeObj(req.body);
  }
  next();
});

// Rate Limiter for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // Strictly limit each IP to 1 order per 1 minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are placing orders too quickly. Please wait 1 minute.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute cooldown
  max: 1, // 1 message per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You are sending messages too quickly. Please wait 1 minute.' }
});

const subscribeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute cooldown
  max: 1, // 1 subscription per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You are subscribing too quickly. Please wait 1 minute.' }
});


// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  const allowedRoles = ['Admin', 'Manager', 'Editor'];
  if (!req.user?.username && !allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }

  // Audit Logging
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const adminUsername = req.user.username || req.user.email || 'Admin';
    const actionType = req.method;
    const endpoint = req.originalUrl;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    try {
      await pool.query(
        'INSERT INTO audit_logs (admin_username, action_type, endpoint, ip_address) VALUES (?, ?, ?, ?)',
        [adminUsername, actionType, endpoint, ipAddress]
      );
    } catch (err) {
      console.error('Audit Log Error:', err);
    }
  }

  next();
};

const requireSuperAdmin = async (req, res, next) => {
  const email = req.user?.email || req.user?.username;
  if (email !== 'mdtowhid5577@gmail.com' && email !== 'iamnabilgamer@gmail.com') {
    return res.status(403).json({ error: 'Super Admin privileges required.' });
  }

  // Audit Logging
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const actionType = req.method;
    const endpoint = req.originalUrl;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    try {
      await pool.query(
        'INSERT INTO audit_logs (admin_username, action_type, endpoint, ip_address) VALUES (?, ?, ?, ?)',
        [email, actionType, endpoint, ipAddress]
      );
    } catch (err) {
      console.error('Audit log failed', err);
    }
  }
  next();
};

const trafficStats = {
  startedAt: Date.now(),
  totalRequests: 0,
  totalRequestBytes: 0,
  totalResponseBytes: 0,
  statusCounts: {},
  ipCounts: new Map(),
  minuteBuckets: []
};

const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
const recordTraffic = (req, res) => {
  const now = Date.now();
  const minute = Math.floor(now / 60000) * 60000;
  trafficStats.totalRequests += 1;
  trafficStats.totalRequestBytes += Number(req.headers['content-length'] || 0);
  const ip = getClientIp(req);
  const ipRecord = trafficStats.ipCounts.get(ip) || { count: 0, lastSeen: now };
  ipRecord.count += 1;
  ipRecord.lastSeen = now;
  trafficStats.ipCounts.set(ip, ipRecord);
  let bucket = trafficStats.minuteBuckets.find(item => item.minute === minute);
  if (!bucket) {
    bucket = { minute, requests: 0, requestBytes: 0, responseBytes: 0, errors: 0, rateLimited: 0, uniqueIps: new Set() };
    trafficStats.minuteBuckets.push(bucket);
  }
  bucket.requests += 1;
  bucket.requestBytes += Number(req.headers['content-length'] || 0);
  bucket.uniqueIps.add(ip);
  let responseBytes = 0;
  const originalWrite = res.write;
  const originalEnd = res.end;
  res.write = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk);
    return originalWrite.call(this, chunk, ...args);
  };
  res.end = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk);
    return originalEnd.call(this, chunk, ...args);
  };
  res.on('finish', () => {
    trafficStats.totalResponseBytes += responseBytes;
    bucket.responseBytes += responseBytes;
    const status = String(res.statusCode);
    trafficStats.statusCounts[status] = (trafficStats.statusCounts[status] || 0) + 1;
    if (res.statusCode >= 400) bucket.errors += 1;
    if (res.statusCode === 429) bucket.rateLimited += 1;
  });
};

app.use((req, res, next) => {
  recordTraffic(req, res);
  const cutoff = Date.now() - 15 * 60 * 1000;
  trafficStats.minuteBuckets = trafficStats.minuteBuckets.filter(item => item.minute >= cutoff);
  for (const [ip, record] of trafficStats.ipCounts) {
    if (record.lastSeen < cutoff) trafficStats.ipCounts.delete(ip);
  }
  next();
});

const readNetworkBytes = () => {
  try {
    const content = fs.readFileSync('/proc/net/dev', 'utf8');
    return content.split('\n').slice(2).reduce((total, line) => {
      const parts = line.trim().split(':');
      const fields = parts[1]?.trim().split(/\s+/) || [];
      return parts[0] && parts[0] !== 'lo' && fields.length >= 9 ? { rx: total.rx + Number(fields[0]), tx: total.tx + Number(fields[8]) } : total;
    }, { rx: 0, tx: 0 });
  } catch { return { rx: null, tx: null }; }
};
// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let ext = '.jpg';
    if (file.mimetype === 'image/png') ext = '.png';
    else if (file.mimetype === 'image/webp') ext = '.webp';
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) return cb(new Error('Only JPG, PNG and WebP images are allowed.'));
    cb(null, true);
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Setup Initial Tables (Run on boot)
async function initializeDB() {
  try {
    console.log('Database connected successfully (SQLite).');
    
    // Seed default homepage sections if empty
    const [sections] = await pool.query('SELECT COUNT(*) as count FROM homepage_sections');
    if (sections[0].count === 0) {
      const defaultSections = [
        ['new_arrivals', 'NEW ARRIVALS', 1, 1],
        ['mens', 'MENS COLLECTION', 1, 2],
        ['womens', 'WOMENS COLLECTION', 1, 3],
        ['features', 'FEATURES', 1, 4]
      ];
      for (const sec of defaultSections) {
        await pool.query('INSERT OR IGNORE INTO homepage_sections (section_key, title, is_active, display_order) VALUES (?, ?, ?, ?)', sec);
      }
    }

    // Seed default settings
    const defaultNewSettings = [
      ['delivery_dhaka', '60'],
      ['delivery_outside', '120'],
      ['social_fb', '#'],
      ['social_ig', '#'],
      ['social_tt', '#'],
      ['social_yt', '#'],
      ['social_x', '#'],
      ['logo_url', ''],
      ['favicon_url', ''],
      ['hotline', '+880 9611 707982'],
      ['whatsapp_number', '+880 1410 954642'],
      ['contact_email', 'support@arhamclothing.com'],
      ['seo_title', 'Arham Clothing | Everyday Essentials'],
      ['seo_description', 'Discover refined everyday essentials from Arham Clothing.'],
      ['seo_keywords', 'fashion, clothing, lifestyle, online fashion Bangladesh, Arham Clothing'],
      ['seo_author', 'Arham Clothing'],
      ['seo_canonical_url', ''],
      ['seo_robots', 'index,follow'],
      ['seo_og_title', ''],
      ['seo_og_description', ''],
      ['seo_og_image', ''],
      ['seo_twitter_card', 'summary_large_image'],
      ['gsc_verification_method', 'meta'],
      ['gsc_verification_code', ''],
      ['gsc_html_file_name', ''],
      ['gsc_dns_record', '']
    ];
    for (const st of defaultNewSettings) {
      try { await pool.query('INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', st); } catch {}
    }

    // Seed default policies
    const [policiesCount] = await pool.query('SELECT COUNT(*) as count FROM policies');
    if (policiesCount[0].count === 0) {
      const defaultPolicies = [
        ['privacy-policy', 'Privacy Policy', '<p>Your privacy policy here.</p>'],
        ['refund-policy', 'Refund Policy', '<p>Your refund policy here.</p>'],
        ['terms-of-service', 'Terms of Service', '<p>Your terms of service here.</p>']
      ];
      for (const p of defaultPolicies) {
        await pool.query('INSERT OR IGNORE INTO policies (policy_key, title, content) VALUES (?, ?, ?)', p);
      }
    }

    // Seed default pages
    const [pagesCount] = await pool.query('SELECT COUNT(*) as count FROM pages');
    if (pagesCount[0].count === 0) {
      const defaultPages = [
        ['stores', 'OUR STORES', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto;">We are currently operating exclusively online to bring you the best prices and nationwide delivery. Physical flagship stores in Dhaka are coming soon! Stay tuned to our social media for updates.</p>'],
        ['corporate', 'CORPORATE ORDERS', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto 24px auto;">Elevate your corporate gifting and team apparel with ARHAM CLOTHING. We offer bulk purchasing options, custom branding, and premium quality garments tailored for your organization.</p><div style="background: #f8f9fa; padding: 24px; border-radius: 8px; border: 1px solid #eaeaea; display: inline-block;"><p style="font-weight: bold; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">For Corporate Inquiries</p><a href="mailto:corporate@arhamclothing.com" style="font-size: 18px; color: #111; text-decoration: underline; font-weight: 600;">corporate@arhamclothing.com</a></div>'],
        ['careers', 'CAREERS AT ARHAM CLOTHING', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto 32px auto;">We are always on the lookout for passionate, creative, and driven individuals to join our growing team. Currently, we do not have any open positions, but we\'d love to keep your resume on file for future opportunities.</p><div style="background: #f8f9fa; padding: 24px; border-radius: 8px; border: 1px solid #eaeaea; display: inline-block;"><p style="font-weight: bold; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">Drop Your Resume At</p><a href="mailto:careers@arhamclothing.com" style="font-size: 18px; color: #111; text-decoration: underline; font-weight: 600;">careers@arhamclothing.com</a></div>'],
        ['about', 'OUR STORY', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto;">Welcome to ARHAM CLOTHING, where premium fashion meets everyday comfort. Born in Bangladesh and built for the world, we believe that style should never come at the expense of quality. Our journey started with a simple idea: to create minimalist, high-quality apparel that empowers individuals to look and feel their best.</p>'],
        ['contact', 'CONTACT US', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto;">Have questions? We\'re here to help. Reach out to us through any of the channels below.</p>'],
        ['faq', 'FREQUENTLY ASKED QUESTIONS', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto;">Find answers to common questions about our products, orders, and delivery below.</p>'],
        ['blog', 'OUR BLOG', '<p style="color: #666; max-width: 600px; font-size: 16px; line-height: 1.6; margin: 0 auto;">Coming soon. Stay tuned for style tips, brand news, and behind-the-scenes content.</p>']
      ];
      for (const p of defaultPages) {
        await pool.query('INSERT OR IGNORE INTO pages (page_key, title, content) VALUES (?, ?, ?)', p);
      }
    }

    console.log('✅ Database seeds verified successfully');
  } catch (error) {
    console.error('❌ Database init failed:', error);
  }
}
initializeDB();

// --- API ROUTES ---

// 0. Settings
app.get('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    // Convert array of {key, value} to single object
    const settingsObj = {};
    rows.forEach(r => settingsObj[r.setting_key] = r.setting_value);
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }
    if (settings.meta_pixel_id && !/^\d{5,30}$/.test(String(settings.meta_pixel_id).trim())) {
      return res.status(400).json({ error: 'Meta Pixel ID must contain 5–30 digits.' });
    }
    if (settings.meta_pixel_active !== undefined && !['0', '1', 0, 1, false, true].includes(settings.meta_pixel_active)) {
      return res.status(400).json({ error: 'Invalid Meta Pixel active value.' });
    }
    for (const [key, value] of Object.entries(settings)) {
      if (!/^[a-z0-9_]{1,50}$/i.test(key)) continue;
      await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, String(value), String(value)]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs Endpoint
app.get('/api/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic Upload Asset (for Logo, Favicon, etc.)
app.post('/api/admin/upload-asset', authenticateToken, requireAdmin, upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Create a product
app.post('/api/products', authenticateToken, requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), async (req, res) => {
  try {
    const { 
      title, price, oldPrice, isSale, category, subcategory, sizes, stock, description, galleryUrls, specifications, size_chart, tags 
    } = req.body;
    
    // Primary image
    let imageUrl = null;
    if (req.files && req.files['image']) {
      imageUrl = `/uploads/${req.files['image'][0].filename}`;
    }

    // Build gallery: merge URL strings + uploaded files
    let galleryArr = [];
    if (galleryUrls) {
      galleryArr = galleryUrls.split('\n').map(s => s.trim()).filter(s => s);
    }
    if (req.files && req.files['galleryImages']) {
      req.files['galleryImages'].forEach(f => galleryArr.push(`/uploads/${f.filename}`));
    }
    const gallery = galleryArr.length > 0 ? JSON.stringify(galleryArr) : null;

    const query = `INSERT INTO products (title, price, oldPrice, isSale, imageUrl, category, subcategory, sizes, stock, description, gallery, specifications, size_chart, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      title, price, oldPrice ? oldPrice : null, 
      isSale === 'true' || isSale === true ? 1 : 0, 
      imageUrl, category, subcategory || null,
      sizes ? sizes : null, stock || 0, description || '',
      gallery,
      specifications ? specifications : null,
      size_chart ? size_chart : null,
      tags || ''
    ];

    const [result] = await pool.query(query, values);
    const baseSlug = slugify(title);
    const [collision] = await pool.query('SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1', [baseSlug, result.insertId]);
    const finalSlug = collision.length ? `${baseSlug}-${result.insertId}` : baseSlug;
    await pool.query('UPDATE products SET slug = ? WHERE id = ?', [finalSlug, result.insertId]);
    res.status(201).json({ id: result.insertId, slug: finalSlug, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Update a product
app.put('/api/products/:id', authenticateToken, requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, price, oldPrice, isSale, category, subcategory, sizes, stock, description, galleryUrls, specifications, size_chart, tags 
    } = req.body;
    console.log("UPDATE payload specs:", specifications, "size_chart:", size_chart);

    // Build gallery: merge URL strings + uploaded files
    let galleryArr = [];
    if (galleryUrls) {
      galleryArr = galleryUrls.split('\n').map(s => s.trim()).filter(s => s);
    }
    if (req.files && req.files['galleryImages']) {
      req.files['galleryImages'].forEach(f => galleryArr.push(`/uploads/${f.filename}`));
    }
    const gallery = galleryArr.length > 0 ? JSON.stringify(galleryArr) : null;
    
    const baseSlug = slugify(title);
    const [collision] = await pool.query('SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1', [baseSlug, id]);
    const finalSlug = collision.length ? `${baseSlug}-${id}` : baseSlug;
    let updateQuery = `UPDATE products SET title=?, slug=?, price=?, oldPrice=?, isSale=?, category=?, subcategory=?, sizes=?, stock=?, description=?, gallery=?, specifications=?, size_chart=?, tags=?`;
    const values = [
      title, finalSlug, price, oldPrice ? oldPrice : null, 
      isSale === 'true' || isSale === true ? 1 : 0, 
      category, subcategory || null,
      sizes ? sizes : null, stock || 0, description || '',
      gallery,
      specifications ? specifications : null,
      size_chart ? size_chart : null,
      tags || ''
    ];

    if (req.files && req.files['image']) {
      updateQuery += `, imageUrl=?`;
      values.push(`/uploads/${req.files['image'][0].filename}`);
    }

    updateQuery += ` WHERE id=?`;
    values.push(id);

    await pool.query(updateQuery, values);
    res.json({ slug: finalSlug, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const [result] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subcategories API (legacy - kept for backward compat)
app.get('/api/subcategories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subcategories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subcategories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category_id, name, slug } = req.body;
    const [result] = await pool.query('INSERT INTO subcategories (category_id, name, slug) VALUES (?, ?, ?)', [category_id, name, slug]);
    res.status(201).json({ id: result.insertId, message: 'Subcategory created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM subcategories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subcategory deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Menu Items API (3-level category system) ──
// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  main_category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// GET all menu items
app.get('/api/menu-items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY main_category, sub_category, display_order, name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET menu items grouped for mega menu
app.get('/api/menu-structure', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY main_category, sub_category, display_order, name ASC');
    // Group by main_category -> sub_category
    const structure = {};
    rows.forEach(item => {
      if (!structure[item.main_category]) structure[item.main_category] = {};
      if (!structure[item.main_category][item.sub_category]) structure[item.main_category][item.sub_category] = [];
      structure[item.main_category][item.sub_category].push({ id: item.id, name: item.name, slug: item.slug });
    });
    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new menu item
app.post('/api/menu-items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { main_category, sub_category, name, slug, display_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menu_items (main_category, sub_category, name, slug, display_order) VALUES (?, ?, ?, ?, ?)',
      [main_category, sub_category, name, slug, display_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Menu item created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE menu item
app.delete('/api/menu-items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Features API
app.get('/api/features', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM features ORDER BY display_order ASC, id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/features', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, icon, is_active } = req.body;
    const [result] = await pool.query(
      'INSERT INTO features (title, description, icon, is_active) VALUES (?, ?, ?, ?)',
      [title, description, icon, is_active ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Feature created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/features/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, icon, is_active } = req.body;
    await pool.query(
      'UPDATE features SET title=?, description=?, icon=?, is_active=? WHERE id=?',
      [title, description, icon, is_active ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Feature updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/features/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM features WHERE id = ?', [req.params.id]);
    res.json({ message: 'Feature deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announcements API
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/announcements', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { type, message, link_url, is_active } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const [result] = await pool.query(
      'INSERT INTO announcements (type, message, link_url, is_active, image_url) VALUES (?, ?, ?, ?, ?)',
      [type, message || '', link_url || null, is_active === 'true' || is_active === true ? 1 : 0, imageUrl]
    );
    res.status(201).json({ id: result.insertId, message: 'Announcement created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/announcements/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { type, message, link_url, is_active } = req.body;
    
    let updateQuery = 'UPDATE announcements SET type=?, message=?, link_url=?, is_active=? WHERE id=?';
    let queryParams = [type, message || '', link_url || null, is_active === 'true' || is_active === true ? 1 : 0, req.params.id];

    if (req.file) {
      updateQuery = 'UPDATE announcements SET type=?, message=?, link_url=?, is_active=?, image_url=? WHERE id=?';
      queryParams = [type, message || '', link_url || null, is_active === 'true' || is_active === true ? 1 : 0, `/uploads/${req.file.filename}`, req.params.id];
    }
    
    await pool.query(updateQuery, queryParams);
    res.json({ message: 'Announcement updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hero Sliders API
app.get('/api/sliders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hero_sliders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sliders', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    const { link_url, is_active } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const [result] = await pool.query(
      'INSERT INTO hero_sliders (image_url, link_url, is_active) VALUES (?, ?, ?)',
      [imageUrl, link_url || null, is_active === 'true' || is_active === true ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Slider created', image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sliders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.query('UPDATE hero_sliders SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Slider status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sliders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM hero_sliders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Slider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete a product
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Place an order (Checkout)
app.post('/api/orders', checkoutLimiter, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let { customer_name, phone, email, city, postal_code, address, area, items, user_id, meta } = req.body;
    
    // Sanitize inputs to prevent HTML/XSS injection
    const sanitizeHtml = (str) => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    customer_name = sanitizeHtml(customer_name);
    city = sanitizeHtml(city);
    address = sanitizeHtml(address);
    email = sanitizeHtml(email);
    postal_code = sanitizeHtml(postal_code);
    phone = sanitizeHtml(phone);    
    if (!String(customer_name || '').trim() || !String(phone || '').trim() || !String(address || '').trim() || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer details and at least one item are required.' });
    }
    if (items.length > 100) {
      return res.status(400).json({ error: 'Too many items.' });
    }

    // 1. Securely calculate subtotal and construct verified items array
    let subtotal = 0;
    const verifiedItems = [];
    
    for (const item of items) {
      if (!item.id || !item.quantity || Number(item.quantity) <= 0) continue;
      
      const [productRows] = await conn.query('SELECT title, price, imageUrl FROM products WHERE id = ?', [item.id]);
      if (productRows.length === 0) {
         throw new Error(`Product ID ${item.id} not found`);
      }
      
      const product = productRows[0];
      const itemPrice = Number(product.price);
      subtotal += itemPrice * Number(item.quantity);
      
      verifiedItems.push({
        id: item.id,
        title: product.title,
        price: itemPrice, // Server-side verified price
        quantity: Number(item.quantity),
        size: item.size || '',
        imageUrl: product.imageUrl
      });
    }

    if (verifiedItems.length === 0) {
      return res.status(400).json({ error: 'No valid items in the order.' });
    }

    // 2. Securely calculate delivery charge based on area
    const [settingRows] = await conn.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN ("delivery_dhaka", "delivery_outside")');
    let delivery_dhaka = 60;
    let delivery_outside = 120;
    settingRows.forEach(row => {
      if (row.setting_key === 'delivery_dhaka') delivery_dhaka = Number(row.setting_value) || 60;
      if (row.setting_key === 'delivery_outside') delivery_outside = Number(row.setting_value) || 120;
    });

    // Check frontend area, fallback to city name if needed
    const isDhaka = (area === 'DHAKA' || String(city).toUpperCase().includes('DHAKA'));
    const deliveryCost = isDhaka ? delivery_dhaka : delivery_outside;
    
    // 3. Final secure grand total
    const secure_total_amount = subtotal + deliveryCost;
    const items_json = JSON.stringify(verifiedItems);
    
    const query = `INSERT INTO orders (customer_name, phone, email, city, postal_code, address, total_amount, items_json, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await conn.query(query, [customer_name, phone, email, city, postal_code, address, secure_total_amount, items_json, user_id || null]);
    
    // Deduct stock
    for (const item of verifiedItems) {
      await conn.query(`UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?`, [item.quantity, item.id]);
    }
    
    await conn.commit();
    const eventId = `order_${result.insertId}_${Date.now()}`;
    try {
      await sendMetaEvent({
        eventName: 'Purchase',
        eventId,
        eventSourceUrl: meta?.event_source_url,
        email,
        phone,
        value: secure_total_amount,
        fbp: meta?.fbp,
        fbc: meta?.fbc,
        clientIp: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
    } catch (metaError) {
      console.error('Meta Purchase event failed:', metaError.message);
    }
    res.status(201).json({ orderId: result.insertId, eventId, message: 'Order placed successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// 5. Get all orders (for Admin Panel)
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5.1 Get single order by ID (Secure)
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const order = rows[0];
    
    // Authorization: Allow if Admin OR if the user_id matches the requester
    if (req.user.role !== 'Admin' && (!req.user.username) && (req.user.userId !== order.user_id)) {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5.5 Update order status
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, tracking_id } = req.body;
    let query = 'UPDATE orders SET status = ? WHERE id = ?';
    let params = [status, req.params.id];
    
    if (tracking_id !== undefined) {
      query = 'UPDATE orders SET status = ?, tracking_id = ? WHERE id = ?';
      params = [status, tracking_id, req.params.id];
    }
    
    await pool.query(query, params);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5.6 Delete order
app.delete('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Visit Tracking Endpoint
app.post('/api/track-visit', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // We can do a simplistic check to not spam if they refresh, but let's just log it. 
    // The frontend uses sessionStorage to only call this once per session.
    await pool.query('INSERT INTO visits (ip_address) VALUES (?)', [ip]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Analytics for Admin Dashboard
app.get('/api/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // REVENUE
    const [revAllTime] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('Cancelled', 'Refunded')`);
    const [revToday] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('Cancelled', 'Refunded') AND DATE(created_at) = CURDATE()`);
    const [revWeekly] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('Cancelled', 'Refunded') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`);
    const [revMonthly] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('Cancelled', 'Refunded') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
    const [revYearly] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('Cancelled', 'Refunded') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`);

    // VISITS
    const [visAllTime] = await pool.query(`SELECT COUNT(*) as total FROM visits`);
    const [visToday] = await pool.query(`SELECT COUNT(*) as total FROM visits WHERE DATE(visited_at) = CURDATE()`);
    const [visWeekly] = await pool.query(`SELECT COUNT(*) as total FROM visits WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`);
    const [visMonthly] = await pool.query(`SELECT COUNT(*) as total FROM visits WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
    const [visYearly] = await pool.query(`SELECT COUNT(*) as total FROM visits WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`);

    // ORDERS
    const [ordersTotal] = await pool.query(`SELECT COUNT(*) as total FROM orders`);
    const [ordersSuccess] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Delivered'`);
    const [ordersPending] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Pending'`);
    const [ordersProcessing] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Processing'`);
    const [ordersShipped] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Shipped'`);
    const [ordersCancelled] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Cancelled'`);
    const [ordersRefunded] = await pool.query(`SELECT COUNT(*) as total FROM orders WHERE status = 'Refunded'`);

    // PRODUCTS
    const [productsTotal] = await pool.query(`SELECT COUNT(*) as total FROM products`);
    const [productsByCategory] = await pool.query(`SELECT category, COUNT(*) as count FROM products GROUP BY category`);

    // GRAPH DATA (Last 30 days)
    const [graphDataRows] = await pool.query(`
      SELECT 
        DATE(created_at) as date, 
        SUM(total_amount) as revenue,
        COUNT(id) as orders
      FROM orders 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);

    const [visitGraphRows] = await pool.query(`
      SELECT 
        DATE(visited_at) as date, 
        COUNT(id) as visits
      FROM visits 
      WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
      GROUP BY DATE(visited_at) 
      ORDER BY date ASC
    `);

    // Merge graph data based on dates
    const mergedGraphMap = {};
    
    // Initialize last 30 days with 0s
    for(let i=29; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      mergedGraphMap[dateStr] = { date: dateStr, revenue: 0, orders: 0, visits: 0 };
    }

    graphDataRows.forEach(row => {
      const dStr = new Date(row.date).toISOString().split('T')[0];
      if(mergedGraphMap[dStr]) {
        mergedGraphMap[dStr].revenue = Number(row.revenue) || 0;
        mergedGraphMap[dStr].orders = Number(row.orders) || 0;
      }
    });

    visitGraphRows.forEach(row => {
      const dStr = new Date(row.date).toISOString().split('T')[0];
      if(mergedGraphMap[dStr]) {
        mergedGraphMap[dStr].visits = Number(row.visits) || 0;
      }
    });

    const finalGraphData = Object.values(mergedGraphMap);

    res.json({
      revenue: {
        allTime: revAllTime[0].total || 0,
        today: revToday[0].total || 0,
        weekly: revWeekly[0].total || 0,
        monthly: revMonthly[0].total || 0,
        yearly: revYearly[0].total || 0,
      },
      visits: {
        allTime: visAllTime[0].total || 0,
        today: visToday[0].total || 0,
        weekly: visWeekly[0].total || 0,
        monthly: visMonthly[0].total || 0,
        yearly: visYearly[0].total || 0,
      },
      orders: {
        total: ordersTotal[0].total || 0,
        success: ordersSuccess[0].total || 0,
        pending: ordersPending[0].total || 0,
        processing: ordersProcessing[0].total || 0,
        shipped: ordersShipped[0].total || 0,
        cancelled: ordersCancelled[0].total || 0,
        refunded: ordersRefunded[0].total || 0,
      },
      products: {
        total: productsTotal[0].total || 0,
        byCategory: productsByCategory
      },
      graphData: finalGraphData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/traffic-monitor', authenticateToken, requireAdmin, async (req, res) => {
  const now = Date.now();
  const lastMinute = trafficStats.minuteBuckets.filter(item => item.minute >= now - 60000);
  const lastFiveMinutes = trafficStats.minuteBuckets.filter(item => item.minute >= now - 300000);
  const requestsLastMinute = lastMinute.reduce((sum, item) => sum + item.requests, 0);
  const errorsLastMinute = lastMinute.reduce((sum, item) => sum + item.errors, 0);
  const rateLimitedLastMinute = lastMinute.reduce((sum, item) => sum + item.rateLimited, 0);
  const topIps = [...trafficStats.ipCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([ip, record]) => ({ ip, requests: record.count, lastSeen: record.lastSeen }));
  const suspiciousIps = topIps.filter(item => item.requests >= 60).length;
  const ddosDetected = requestsLastMinute >= 300 || suspiciousIps > 0 || rateLimitedLastMinute >= 10;
  res.json({
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    ddosDetected,
    threatLevel: ddosDetected ? 'high' : (requestsLastMinute >= 150 || errorsLastMinute >= 30 ? 'elevated' : 'normal'),
    requests: { total: trafficStats.totalRequests, lastMinute: requestsLastMinute, lastFiveMinutes: lastFiveMinutes.reduce((sum, item) => sum + item.requests, 0) },
    errors: { lastMinute: errorsLastMinute, rateLimitedLastMinute, statusCounts: trafficStats.statusCounts },
    bandwidth: { applicationRequestBytes: trafficStats.totalRequestBytes, applicationResponseBytes: trafficStats.totalResponseBytes, serverReceivedBytes: readNetworkBytes().rx, serverSentBytes: readNetworkBytes().tx },
    topIps,
    note: 'Application counters reset when the backend restarts. Server network counters come from /proc/net/dev.'
  });
});

// Contact Messages
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    let { name, email, subject, message } = req.body;
    
    // Sanitize inputs
    const sanitizeHtml = (str) => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    name = sanitizeHtml(name);
    email = sanitizeHtml(email);
    subject = sanitizeHtml(subject);
    message = sanitizeHtml(message);

    if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Missing required fields' });
    
    await pool.query('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/messages/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Homepage Sections API
app.get('/api/homepage-sections', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM homepage_sections ORDER BY display_order ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/homepage-sections', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    for (const sec of sections) {
      await pool.query(
        'UPDATE homepage_sections SET title = ?, is_active = ?, display_order = ? WHERE section_key = ?',
        [sec.title, sec.is_active ? 1 : 0, sec.display_order, sec.section_key]
      );
    }
    res.json({ message: 'Homepage sections updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Login Endpoint (Admin)
app.post('/api/admin/google-login', loginLimiter, async (req, res) => {
  const { idToken, accessToken } = req.body;
  if (!idToken && !accessToken) return res.status(400).json({ success: false, message: 'Token missing' });

  try {
    const googleUser = await verifyGoogleToken({ idToken, accessToken });
    const email = googleUser.email;

    // Check if user is the root admin or has an authorized role
    let isAllowed = false;
    let userRole = 'Customer';
    
    if (email === 'mdtowhid5577@gmail.com' || email === 'iamnabilgamer@gmail.com') {
      isAllowed = true;
      userRole = 'Admin';
      // Auto-upsert root admin
      await pool.query(
        'INSERT INTO users (uid, firebase_uid, email, name, photo_url, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE role="Admin", name=VALUES(name), photo_url=VALUES(photo_url)', 
        [googleUser.uid, googleUser.uid, email, googleUser.name, googleUser.picture, 'Admin']
      );
    } else {
      const [rows] = await pool.query('SELECT role FROM users WHERE email = ? AND role IN ("Admin", "Manager", "Editor")', [email]);
      if (rows.length > 0) {
        isAllowed = true;
        userRole = rows[0].role;
      }
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Access Denied: You do not have admin privileges.' });
    }

    const token = jwt.sign({ username: email, role: userRole }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, email, role: userRole });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google login: ' + error.message });
  }
});

// GET Public Settings (Logo, Favicon, Social Links, Contact Info)
app.get('/api/public-settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN ("logo_url", "favicon_url", "social_fb", "social_ig", "social_tt", "social_yt", "social_x", "hotline", "whatsapp_number", "contact_email", "delivery_dhaka", "delivery_subcity", "delivery_outside", "meta_pixel_id", "meta_pixel_active", "seo_title", "seo_description", "seo_keywords", "seo_author", "seo_canonical_url", "seo_robots", "seo_og_title", "seo_og_description", "seo_og_image", "seo_twitter_card", "gsc_verification_method", "gsc_verification_code", "top_bar_text", "top_bar_active", "promo_bar_text", "promo_bar_active", "support_phone", "support_days", "support_hours")');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const xmlEscape = (value) => String(value).replace(/[<>&'"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
const getPublicSiteUrl = async () => {
  const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['seo_canonical_url']);
  const configured = rows[0]?.setting_value?.trim();
  const isLocalUrl = configured && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(configured);
  const fallbackSiteUrl = process.env.PUBLIC_SITE_URL || 'https://arhamclothing.com';
  return ((configured && !isLocalUrl) ? configured : fallbackSiteUrl).replace(/\/$/, '');
};

const sha256 = (value) => crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex');
const getSetting = async (key) => {
  const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
  return rows[0]?.setting_value?.trim() || '';
};

const sendMetaEvent = async ({ eventName, eventId, eventSourceUrl, email, phone, value, currency = 'BDT', fbp, fbc, clientIp, userAgent, testEventCode }) => {
  const pixelId = await getSetting('meta_pixel_id');
  const accessToken = await getSetting('meta_api_token');
  if (!pixelId || !accessToken) return { skipped: true, reason: 'Meta Pixel ID or Conversions API token is not configured.' };

  const userData = {
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
    em: email ? [sha256(email)] : undefined,
    ph: phone ? [sha256(phone.replace(/\D/g, ''))] : undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined
  };
  Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl || `${await getPublicSiteUrl()}/`,
    action_source: 'website',
    user_data: userData,
    custom_data: Number.isFinite(Number(value)) ? { value: Number(value), currency } : undefined
  };
  if (!event.custom_data) delete event.custom_data;
  const version = process.env.META_GRAPH_API_VERSION || 'v23.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [event], access_token: accessToken, ...(testEventCode ? { test_event_code: testEventCode } : {}) })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || `Meta API returned ${response.status}`);
  return result;
};

app.get('/robots.txt', async (req, res) => {
  try {
    const siteUrl = await getPublicSiteUrl();
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${siteUrl}/sitemap.xml\n`);
  } catch {
    res.type('text/plain').send('User-agent: *\nAllow: /\n');
  }
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = await getPublicSiteUrl();
    const [products] = await pool.query('SELECT id, slug FROM products ORDER BY id DESC');
    const paths = ['/', '/shop', '/about', '/contact', '/faq', '/blog', '/stores', '/corporate', '/careers', '/privacy-policy', '/refund-policy', '/terms-of-service', ...products.map(product => `/product/${encodeURIComponent(product.slug || product.id)}`)];
    const urls = paths.map(path => `  <url><loc>${xmlEscape(`${siteUrl}${path}`)}</loc></url>`).join('\n');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  } catch {
    res.status(500).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

app.get(/^\/google-site-verification-[A-Za-z0-9_-]+\.html$/, async (req, res) => {
  try {
    const filename = req.path.slice(1);
    const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['gsc_html_file_name']);
    const [tokens] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['gsc_verification_code']);
    if (rows[0]?.setting_value === filename && tokens[0]?.setting_value) {
      return res.type('text/plain').send(`google-site-verification: ${filename}`);
    }
    return res.status(404).send('Not found');
  } catch {
    return res.status(404).send('Not found');
  }
});

// GET Policy (Public)
app.get('/api/policies/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT title, content FROM policies WHERE policy_key = ?', [req.params.key]);
    if (rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Policies (Admin)
app.get('/api/admin/policies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT policy_key, title, content FROM policies');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Policy (Admin)
app.put('/api/admin/policies/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    await pool.query('UPDATE policies SET content = ? WHERE policy_key = ?', [content, req.params.key]);
    res.json({ message: 'Policy updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pages API
app.get('/api/pages/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT title, content, is_active FROM pages WHERE page_key = ?', [req.params.key]);
    if (rows.length === 0 || !rows[0].is_active) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/pages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT page_key, title, content, is_active FROM pages');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/pages/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { content, is_active } = req.body;
    // Fallback to existing is_active if not provided in the payload for backwards compatibility during migration
    if (is_active !== undefined) {
      await pool.query('UPDATE pages SET content = ?, is_active = ? WHERE page_key = ?', [content, is_active, req.params.key]);
    } else {
      await pool.query('UPDATE pages SET content = ? WHERE page_key = ?', [content, req.params.key]);
    }
    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login Endpoint (Frontend)
app.post('/api/user/login', async (req, res) => {
  const { idToken, accessToken } = req.body;
  if (!idToken && !accessToken) return res.status(400).json({ success: false, message: 'Token missing' });

  try {
    const googleUser = await verifyGoogleToken({ idToken, accessToken });
    const { uid, email, name, picture: photo_url } = googleUser;
    
    // Upsert user in database (check by uid, firebase_uid, or email)
    const [existingUser] = await pool.query('SELECT * FROM users WHERE uid = ? OR firebase_uid = ? OR email = ?', [uid, uid, email]);
    let userId;
    let userRole = 'Customer';
    let phone = null;
    let address = null;
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      userRole = existingUser[0].role;
      phone = existingUser[0].phone;
      address = existingUser[0].address;
      await pool.query('UPDATE users SET email=?, name=?, photo_url=?, uid=? WHERE id=?', [email || null, name || null, photo_url || null, uid, userId]);
    } else {
      const [result] = await pool.query('INSERT INTO users (uid, firebase_uid, email, name, photo_url, role) VALUES (?, ?, ?, ?, ?, ?)', [uid, uid, email || null, name || null, photo_url || null, 'Customer']);
      userId = result.insertId;
    }

    const token = jwt.sign({ userId, uid, email, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      success: true, 
      token, 
      user: { id: userId, uid, email, name, photo_url, role: userRole, phone, address } 
    });
  } catch (error) {
    console.error('USER LOGIN ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    let { phone, address } = req.body;
    
    // Sanitize inputs
    const sanitizeHtml = (str) => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    phone = sanitizeHtml(phone);
    address = sanitizeHtml(address);

    const userId = req.user.userId;
    await pool.query('UPDATE users SET phone = ?, address = ? WHERE id = ?', [phone, address, userId]);
    res.json({ success: true, message: 'Profile updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Users Endpoints
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  // Allow if admin login token (username) or user token with role Admin
  if (!req.user.username && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    const [users] = await pool.query('SELECT id, name, email, photo_url, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
  if (!req.user.username && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    const { role } = req.body;
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track Order Endpoint
app.post('/api/orders/track', publicWriteLimiter, async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND phone = ?', [orderId, phone]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found with provided details.' });
    }
    res.json({ success: true, order: orders[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Orders
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(400).json({ error: 'User ID missing in token' });
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique customers for marketing
app.get('/api/customers', authenticateToken, async (req, res) => {
  if (!req.user.username && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    const query = `
      SELECT customer_name, email, phone, COUNT(id) as total_orders
      FROM orders
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email, phone, customer_name
      ORDER BY total_orders DESC
    `;
    const [customers] = await pool.query(query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/meta/test-event', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testEventCode = String(req.body?.test_event_code || '').trim();
    if (!/^[A-Za-z0-9_-]{3,100}$/.test(testEventCode)) {
      return res.status(400).json({ success: false, message: 'A valid Meta Test Event Code is required.' });
    }
    const result = await sendMetaEvent({
      eventName: 'Purchase',
      eventId: `test_${Date.now()}`,
      eventSourceUrl: `${await getPublicSiteUrl()}/meta-test`,
      email: 'meta-test@example.com',
      value: 1,
      currency: 'BDT',
      testEventCode
    });
    if (result.skipped) return res.status(400).json({ success: false, message: result.reason });
    res.json({ success: true, message: 'Test Purchase event sent to Meta.', result });
  } catch (error) {
    console.error('Meta test event failed:', error.message);
    res.status(502).json({ success: false, message: error.message });
  }
});

// Subscribers APIs
app.post('/api/subscribe', subscribeLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }
    
    await pool.query('INSERT IGNORE INTO subscribers (email) VALUES (?)', [email]);
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/subscribers', authenticateToken, async (req, res) => {
  if (!req.user.username && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    const [subscribers] = await pool.query('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC');
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/subscribers/:id', authenticateToken, async (req, res) => {
  if (!req.user.username && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    await pool.query('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/storage', authenticateToken, requireAdmin, (req, res) => {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
      if (error) return res.json({ total: 100, used: 50, free: 50, percentage: 50 });
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        // Just take the first valid disk (usually C:)
        const parts = lines[1].trim().split(/\s+/);
        if (parts.length >= 3) {
          const free = parseInt(parts[1], 10);
          const total = parseInt(parts[2], 10);
          const used = total - free;
          const percentage = ((used / total) * 100).toFixed(1);
          return res.json({ total, used, free, percentage });
        }
      }
      res.json({ total: 100, used: 50, free: 50, percentage: 50 });
    });
  } else {
    exec('df -B1 /', (error, stdout) => {
      if (error) return res.json({ total: 100, used: 50, free: 50, percentage: 50 });
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        if (parts.length >= 4) {
          const total = parseInt(parts[1], 10);
          const used = parseInt(parts[2], 10);
          const free = parseInt(parts[3], 10);
          const percentage = ((used / total) * 100).toFixed(1);
          return res.json({ total, used, free, percentage });
        }
      }
      res.json({ total: 100, used: 50, free: 50, percentage: 50 });
    });
  }
});
// ==========================================
// CPANEL ENDPOINTS (Super Admin Only)
// ==========================================
app.get('/api/admin/cpanel/files', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const dirPath = req.query.path ? path.resolve(req.query.path) : process.cwd();
    if (!dirPath.startsWith(path.resolve(process.cwd()))) {
      return res.status(403).json({ error: 'Access denied outside project root.' });
    }
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
    files.sort((a, b) => (b.isDirectory - a.isDirectory) || a.name.localeCompare(b.name));
    res.json({ currentPath: dirPath, parentPath: path.dirname(dirPath), files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/cpanel/file', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const filePath = path.resolve(req.query.path);
    if (!filePath.startsWith(path.resolve(process.cwd()))) {
      return res.status(403).json({ error: 'Access denied outside project root.' });
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/cpanel/file', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const filePath = path.resolve(req.body.path);
    if (!filePath.startsWith(path.resolve(process.cwd()))) {
      return res.status(403).json({ error: 'Access denied outside project root.' });
    }
    await fs.promises.writeFile(filePath, req.body.content || '', 'utf-8');
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/cpanel/db', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const query = req.body.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query.' });
    }
    const [rows] = await pool.query(query);
    res.json({ success: true, rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/cpanel/db/tables', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]);
    res.json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/cpanel/db/tables/:name/schema', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tableName = req.params.name.replace(/[^a-zA-Z0-9_]/g, '');
    const [rows] = await pool.query(`DESCRIBE \`${tableName}\``);
    res.json({ success: true, schema: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/cpanel/db/tables/:name/data', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tableName = req.params.name.replace(/[^a-zA-Z0-9_]/g, '');
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
    const total = countRows[0].total;
    
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [limit, offset]);
    res.json({ success: true, rows, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
