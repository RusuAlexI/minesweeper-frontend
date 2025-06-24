export const environment = {
  production: false,
// Attempt to read from an environment variable first, fall back to localhost if not set
  apiUrl: process.env['NG_APP_API_URL'] || 'http://localhost:8080/api/game'
};
