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
        alt="Logo" 
        style={{ height: `${size + 10}px`, objectFit: 'contain' }} 
      />
    );
  }

  return (
    <span style={{ 
      display: 'flex', 
      alignItems: 'center', 
      fontWeight: '700', 
      fontSize: `${size}px`, 
      letterSpacing: `${size * 0.25}px`, 
      fontFamily: "'Montserrat', sans-serif",
      color: color
    }}>
      <svg 
        viewBox="0 0 24 24" 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="miter" 
        style={{ marginRight: `${size * 0.1}px`, marginTop: `-${size * 0.1}px` }}
      >
        <path d="M 3 22 L 12 2 L 21 22" />
      </svg>
      UREON
    </span>
  );
};

export default Logo;
