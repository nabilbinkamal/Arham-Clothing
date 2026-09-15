import { useEffect } from 'react';

const SecurityEnforcer = () => {
  useEffect(() => {
    // Keep image dragging disabled without interfering with browser shortcuts,
    // text selection, context menus, saving, or developer tools.
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null; // This is an invisible utility component
};

export default SecurityEnforcer;
