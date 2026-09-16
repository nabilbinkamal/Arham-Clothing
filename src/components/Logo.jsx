import React from 'react';

const Logo = ({ color = "currentColor", size = 28 }) => {
  let logoUrl = null;
  try {
    const pubSettings = JSON.parse(sessionStorage.getItem('publicSettings'));
    if (pubSettings && pubSettings.logo_url) {
      logoUrl = pubSettings.logo_url;
    }
  } catch {}

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Arham Clothing"
        style={{ height: `${size + 10}px`, objectFit: 'contain' }} 
      />
    );
  }

  return <span className="arham-wordmark" style={{ color, fontSize: `${size}px` }}>ARHAM</span>;
};

export default Logo;
