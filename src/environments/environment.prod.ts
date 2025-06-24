export const environment = {
  production: true,
// Attempt to read from an environment variable first, fall back to the direct URL if not set
  apiUrl: process.env['NG_APP_API_URL'] || 'https://minesweeper-backend-grd4.onrender.com/api/game'
};
