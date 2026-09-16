export const GOOGLE_CLIENT_ID = '153863255352-1j7f1101crbnj52begmg9h2mpcolahot.apps.googleusercontent.com';

// Ensure Google Identity Services SDK is loaded
export const loadGoogleSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      return resolve(window.google);
    }

    // Check if script already exists
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(window.google);
      } else if (attempts > 50) {
        clearInterval(interval);
        reject(new Error('Google Identity Services script failed to load. Please check your network or ad blocker.'));
      }
    }, 100);
  });
};

/**
 * Triggers Google OAuth popup using Google Identity Services token client
 * Returns { accessToken }
 */
export const triggerGoogleLogin = async () => {
  const google = await loadGoogleSDK();

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }
          if (!tokenResponse.access_token) {
            return reject(new Error('No access token received from Google'));
          }
          resolve({ accessToken: tokenResponse.access_token });
        },
        error_callback: (nonOAuthError) => {
          reject(nonOAuthError);
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
};
