// Determine the API URL dynamically
// If using a custom environment variable, use that first
// Otherwise, try to determine based on current host
function determineApiUrl() {
  // Check if we have an environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const currentHost = window.location.hostname;
  
  // Special handling for Vercel deployment
  if (currentHost.includes('vercel.app')) {
    // For Vercel, you need to deploy the backend separately
    // and set the VITE_API_URL environment variable in Vercel
    console.error('Backend URL not configured. Please set VITE_API_URL in your Vercel environment variables.');
    return 'https://your-backend-url.com/api'; // This is a placeholder that won't work
  }
  
  // For local development
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3000/api';
  } else {
    // For accessing from other devices on the same network
    return `http://${currentHost}:3000/api`;
  }
}

export const API_URL = determineApiUrl();

// Log the determined API URL
console.log('Using API URL:', API_URL);

// Other configuration options can be added here
export const config = {
  apiUrl: API_URL,
}; 