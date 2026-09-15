export const getMetaCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const trackMetaEvent = (eventName, params = {}, eventId) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params, eventId ? { eventID: eventId } : undefined);
  }
};
