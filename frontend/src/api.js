// Vercel can override this with REACT_APP_API_URL. The Render URL keeps the
// deployed build functional even when no Vercel environment variable is set.
export const API_URL = (process.env.REACT_APP_API_URL || 'https://event-managment-lrwd.onrender.com').replace(/\/$/, '');
