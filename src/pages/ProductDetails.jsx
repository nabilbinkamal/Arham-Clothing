import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, AlertCircle, ChevronRight, Heart, CheckCircle, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { productPath } from '../utils/productUrl';
import { trackMetaEvent } from '../utils/metaPixel';

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

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [sizeChart, setSizeChart] = useState(null);

  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isZooming, setIsZooming] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || galleryImages.length === 0) return;
    const totalImages = galleryImages.length + 1;
    const interval = setInterval(() => {
      setSelectedImageIdx(prev => (prev + 1) % totalImages);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay, galleryImages.length]);

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.2)' });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth <= 768) return;
    setIsZooming(true);
    setAutoPlay(false);
  };
  
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const decodedSlug = decodeURIComponent(slug || '');
        const found = data.find(p => p.slug === decodedSlug || p.id === parseInt(decodedSlug, 10));
        if (found && found.slug && decodedSlug !== found.slug) {
          navigate(productPath(found), { replace: true });
        }
        if (found) {
          const parsedSizes = safeJsonParse(found.sizes, []);
          setAvailableSizes(parsedSizes);
          if (parsedSizes.length > 0) {
            setSize(parsedSizes[0]);
          }

          // Parse gallery
          const g = safeJsonParse(found.gallery, []);
          setGalleryImages(Array.isArray(g) ? g : []);
          
          // Parse specifications
          const s = safeJsonParse(found.specifications, []);
          setSpecs(Array.isArray(s) ? s : []);
          
          // Parse size_chart
          const sc = safeJsonParse(found.size_chart, null);
          setSizeChart(sc && sc.headers && sc.rows && sc.headers.length > 0 && sc.rows.length > 0 ? sc : null);
        }
        setProduct(found);
        
        // Fetch related products (same category, exclude current)
        if (found) {
          const related = data.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4);
          setRelatedProducts(related);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug, navigate]);

  useEffect(() => {
    if (!product) return;
    const canonical = `${window.location.origin}${productPath(product)}`;
    document.title = `${product.title} | AUREON`;
    let description = document.head.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = String(product.description || `${product.title} from AUREON.`).replace(/<[^>]*>/g, '').slice(0, 160);
    let canonicalTag = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonical;
  }, [product]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Product not found.</div>;

  const isOutOfStock = product.stock <= 0;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    const currentImage = selectedImageIdx === 0 ? product.imageUrl : galleryImages[selectedImageIdx - 1];
    addToCart(product, size, quantity, currentImage);
    trackMetaEvent('AddToCart', { content_ids: [String(product.id)], content_name: product.title, content_type: 'product', value: (Number(product.price) || 0) * quantity, currency: 'BDT' });
  };

  return (
    <>
      <style>{`
        @keyframes fadeMainImg {
          from { opacity: 0.5; filter: blur(2px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
      <Header />
      <div style={{ background: '#f8f8f8', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>Shop</span>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/shop?cat=${product.category}`)}>{product.category}</span>
            </>
          )}
          <ChevronRight size={14} />
          <span style={{ fontWeight: 'bold', color: '#111' }}>{product.title}</span>
        </div>
      </div>

      <main className="container product-details-wrap">
        
        {/* Product Image Gallery */}
        <div className="product-details-gallery" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', background: '#f8f8f8', border: '1px solid #eaeaea', cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => setAutoPlay(false)}
          >
            <img 
              key={selectedImageIdx}
              src={selectedImageIdx === 0 ? product.imageUrl : galleryImages[selectedImageIdx - 1]}
              alt={product.title} 
              style={{ 
                width: '100%', objectFit: 'cover', aspectRatio: '1/1', display: 'block',
                ...zoomStyle,
                transition: isZooming ? 'none' : 'transform 0.3s ease-out',
                animation: isZooming ? 'none' : 'fadeMainImg 0.4s ease-out'
              }} 
            />
            {Boolean(product.isSale || product.is_sale) && <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--sale-red)', color: 'white', padding: '4px 10px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', borderRadius: '4px', pointerEvents: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>SALE</span>}
            {product.oldPrice && product.price && parseFloat(product.oldPrice) > parseFloat(product.price) && (
              <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#000', color: 'white', padding: '4px 10px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', borderRadius: '4px', pointerEvents: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                -{Math.round(((parseFloat(product.oldPrice) - parseFloat(product.price)) / parseFloat(product.oldPrice)) * 100)}%
              </span>
            )}
          </div>
          {/* Thumbnails */}
          {(galleryImages.length > 0) && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <img src={product.imageUrl} alt="" onClick={() => { setSelectedImageIdx(0); setAutoPlay(false); }}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: selectedImageIdx === 0 ? '2px solid #111' : '1px solid #eaeaea', opacity: selectedImageIdx === 0 ? 1 : 0.7, transition: 'all 0.2s' }} />
              {galleryImages.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => { setSelectedImageIdx(i + 1); setAutoPlay(false); }}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: selectedImageIdx === i + 1 ? '2px solid #111' : '1px solid #eaeaea', opacity: selectedImageIdx === i + 1 ? 1 : 0.7, transition: 'all 0.2s' }} />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Card */}
        <div className="product-details-info" style={{ wordBreak: 'break-word' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: 0, lineHeight: '1.3' }}>{product.title}</h1>
            <button aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'} aria-pressed={isFavorited} onClick={() => toggleWishlist(product)} style={{ background: isFavorited ? '#fff0f3' : '#f5f5f5', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: isFavorited ? '#ff3366' : '#666', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ff3366'} onMouseOut={e => e.currentTarget.style.color = isFavorited ? '#ff3366' : '#666'}>
              <Heart size={20} fill={isFavorited ? '#ff3366' : 'none'} />
            </button>
          </div>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#111' }}>৳ {product.price}</span>
            {product.oldPrice && <span style={{ fontSize: '15px', color: '#999', textDecoration: 'line-through', fontWeight: '500' }}>৳ {product.oldPrice}</span>}
            {product.oldPrice && (
              <span style={{ background: '#ffeeee', color: '#ff3366', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% Off
              </span>
            )}
          </div>

          {/* Size Selection */}
          {availableSizes && availableSizes.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Select Size:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableSizes.map(s => (
                  <button 
                    key={s}
                    disabled={isOutOfStock}
                    onClick={() => setSize(s)}
                    style={{ 
                      minWidth: '50px', height: '40px', padding: '0 12px',
                      border: size === s ? '2px solid #111' : '1px solid #ddd', 
                      background: '#fff',
                      color: '#111',
                      fontWeight: '600', fontSize: '13px', borderRadius: '4px',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { if(!isOutOfStock && size !== s) e.currentTarget.style.borderColor = '#999' }}
                    onMouseOut={e => { if(!isOutOfStock && size !== s) e.currentTarget.style.borderColor = '#ddd' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {isOutOfStock ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '4px', fontWeight: '600', marginBottom: '24px' }}>
              <AlertCircle size={20} />
              This product is currently out of stock.
            </div>
          ) : (
            <div className="product-actions-row">
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', height: '46px', width: '120px', flexShrink: 0 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}><Minus size={16} /></button>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}><Plus size={16} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                style={{ 
                  background: '#111', color: 'white', height: '46px', padding: '0 32px', fontSize: '14px', 
                  fontWeight: '700', border: 'none', borderRadius: '4px', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  gap: '8px', transition: 'background 0.2s', flex: 1
                }}
                onMouseOver={e => e.currentTarget.style.background = '#333'}
                onMouseOut={e => e.currentTarget.style.background = '#111'}
              >
                <ShoppingBag size={18} /> Add To Cart
              </button>
            </div>
          )}

          {/* Trust Features Box */}
          <div style={{ border: '1px solid #eee', borderRadius: '6px', background: '#fafafa', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>
              <CheckCircle size={18} /> Easy Returns & Exchange
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></div> Tell us within 7 days</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></div> Free return shipping*</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></div> Instant refund on receipt</span>
            </div>
          </div>

          {/* Description */}
          <div style={{ color: '#555', lineHeight: '1.6', fontSize: '13px', marginBottom: '24px' }}>
            {product.description ? (
              <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{product.description}</p>
            ) : (
              <p style={{ margin: 0 }}>Premium quality fabric designed for extreme comfort and style. The garments are made with the finest quality cotton featuring an astonishing finish which provides a smooth construction. The compact finish guarantees that the product's length and width will not change over washes or months of usage.</p>
            )}
          </div>

          {/* Specifications */}
          {specs && specs.length > 0 && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>Detailed Specification:</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {specs.map((spec, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                    <span style={{ marginTop: '2px' }}>•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Size Chart */}
          {sizeChart && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', minWidth: 0, width: '100%' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>Size Chart - In Inches <span style={{ fontStyle: 'italic', fontWeight: '400', textTransform: 'none', fontSize: '12px', color: '#666' }}>(Expected Deviation &lt; 3%)</span></h3>
              <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      {sizeChart.headers.map((h, i) => (
                        <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.rows.map((row, ri) => (
                      <tr key={ri} style={{ background: '#fff' }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



        </div>
      </main>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: '60px 0', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <div className="container">
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '32px', textAlign: 'center' }}>You May Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
};

export default ProductDetails;
