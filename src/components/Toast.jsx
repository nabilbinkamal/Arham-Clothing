import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Add entering animation
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const colors = {
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', icon: <CheckCircle2 size={20} color="#4caf50" /> },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828', icon: <AlertCircle size={20} color="#f44336" /> },
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0', icon: <Info size={20} color="#2196f3" /> },
  };

  const style = colors[toast.type] || colors.info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: style.bg,
      borderLeft: `4px solid ${style.border}`,
      color: style.text,
      padding: '16px 20px',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minWidth: '300px',
      maxWidth: '400px',
      animation: isClosing ? 'slideOutRight 0.3s forwards' : 'slideInRight 0.3s forwards',
      transition: 'opacity 0.3s, transform 0.3s'
    }}>
      {style.icon}
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{toast.message}</span>
      <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: style.text, opacity: 0.7 }}>
        <X size={16} />
      </button>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
