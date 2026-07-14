const express = require('express');
const rateLimit = require('express-rate-limit');
const validateContact = require('../middleware/validateContact');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

// Basic spam / abuse protection: limits how many submissions
// a single IP can make within the configured time window.
const contactLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent. Please try again later.',
  },
});

router.post('/contact', contactLimiter, validateContact, sendContactEmail);

module.exports = router;
