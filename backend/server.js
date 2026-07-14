require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const contactRoutes = require('./routes/contactRoutes');

const app = express();
app.set('trust proxy', 1);

// ── Security & parsing middleware ─────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '20kb' })); // small limit — this only needs to accept form fields

// Only allow requests from the origins listed in CORS_ORIGIN (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl, health checks) with no origin header
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// ── Routes ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'veeray-visuals-contact-backend' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.use('/api', contactRoutes);

// ── Centralized error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Contact backend running on port ${PORT}`);
});
