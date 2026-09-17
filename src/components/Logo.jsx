import React from 'react';

const Logo = ({ color = "currentColor", size = 28 }) => {
  let logoUrl = null;
  try {
    const pubSettings = JSON.parse(sessionStorage.getItem('publicSettings'));
    if (pubSettings && pubSettings.logo_url) {
      logoUrl = pubSettings.logo_url;
    }
  } catch {}

  return (
    <img 
      src={logoUrl || "/logo.png"} 
      alt="Arham Clothing"
      style={{ height: `${size + 15}px`, objectFit: 'contain' }} 
    />
  );
};

export default Logo;
