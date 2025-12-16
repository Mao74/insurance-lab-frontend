import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Importante per i cookie di sessione
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione globale errori (opzionale)
    if (error.response && error.response.status === 401) {
      // Non reindirizzare qui per evitare loop, gestito da AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;