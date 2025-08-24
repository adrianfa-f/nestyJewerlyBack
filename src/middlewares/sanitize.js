// backend/middleware/sanitize.js
const sanitizeHtml = require('sanitize-html');

const sanitizePaymentData = (req, res, next) => {
  if (req.body.metadata) {
    req.body.metadata = JSON.parse(
      sanitizeHtml(JSON.stringify(req.body.metadata), {
        allowedTags: [],
        allowedAttributes: {}
      })
    );
  }
  next();
};