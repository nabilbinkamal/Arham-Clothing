import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AnnouncementBanner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const activeBanners = data.filter(a => a.type === 'banner' && a.is_active);
          setBanners(activeBanners);
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (banners.length === 0) return null;

  return (
    <>
      {banners.map(banner => (
        <div key={banner.id} style={{
          background: '#111',
          color: 'white',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{banner.message}</span>
          {banner.link_url && (
            <Link to={banner.link_url} style={{
              color: 'white',
              textDecoration: 'underline',
              fontWeight: '600'
            }}>
              Learn More
            </Link>
          )}
        </div>
      ))}
    </>
  );
};

export default AnnouncementBanner;
