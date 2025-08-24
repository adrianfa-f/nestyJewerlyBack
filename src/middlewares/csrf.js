// backend/middleware/csrf.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Aplicar a rutas relevantes
app.use('/api/payments/*', csrfProtection);