import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementPopup = () => {
  const [popups, setPopups] = useState([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const activePopups = data.filter(a => a.type === 'popup' && a.is_active);
          // Filter out ones already closed in this session
          const unclosedPopups = activePopups.filter(p => !sessionStorage.getItem(`popup_closed_${p.id}`));
          setPopups(unclosedPopups);
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (popups.length === 0) return null;

  const currentPopup = popups[currentPopupIndex];

  const handleClose = () => {
    sessionStorage.setItem(`popup_closed_${currentPopup.id}`, 'true');
    if (currentPopupIndex < popups.length - 1) {
      setCurrentPopupIndex(prev => prev + 1);
    } else {
      setPopups([]); // all closed
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'scaleIn 0.3s ease-out forwards'
      }}>
        <button onClick={handleClose} style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#888'
        }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Special Announcement</h2>
        
        {currentPopup.image_url && (
          <img 
            src={currentPopup.image_url} 
            alt="Promotion" 
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginBottom: '16px' }} 
          />
        )}

        {currentPopup.message && (
          <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '24px' }}>
            {currentPopup.message}
          </p>
        )}
        
        {currentPopup.link_url && (
          <Link to={currentPopup.link_url} onClick={handleClose} style={{
            display: 'inline-block',
            background: '#111',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            Check it out
          </Link>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementPopup;
