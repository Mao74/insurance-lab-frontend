import api from './api';

/**
 * Esegue il login inviando le credenziali al backend.
 * Il backend dovrebbe impostare un cookie di sessione (HttpOnly).
 */
export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

/**
 * Esegue il logout chiamando l'endpoint del backend.
 * Il backend dovrebbe invalidare la sessione/cookie.
 */
export const logout = async () => {
  return await api.post('/auth/logout');
};

/**
 * Controlla lo stato di autenticazione attuale.
 * Chiama /auth/me per ottenere i dati dell'utente corrente se il cookie è valido.
 */
export const checkAuth = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};