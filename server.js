// ─────────────────────────────────────────────
//  server.js  –  Entry point for SmartSecure API
//  Registers all routes and starts Express server
// ─────────────────────────────────────────────

const path    = require('path');
const express = require('express');
const app     = express();
require('dotenv').config();

// Parse incoming JSON request bodies
app.use(express.json());

// CORS – allow all origins for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Serve frontend static files ─────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Import all route files ──────────────────
const authRoutes             = require('./routes/auth');
const usersRoutes            = require('./routes/users');
const lockersRoutes          = require('./routes/lockers');
const bookingsRoutes         = require('./routes/bookings');
const accessLogsRoutes       = require('./routes/accesslogs');
const paymentsRoutes         = require('./routes/payments');
const maintenanceRoutes      = require('./routes/maintenance');
const notificationsRoutes    = require('./routes/notifications');
const locationsRoutes        = require('./routes/locations');

// ── Mount routes under /api ─────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/lockers',       lockersRoutes);
app.use('/api/bookings',      bookingsRoutes);
app.use('/api/access-logs',   accessLogsRoutes);
app.use('/api/payments',      paymentsRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/locations',     locationsRoutes);

// ── SPA fallback – serve index.html for all non-API routes ──
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler ────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// ── Start the server ────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SmartSecure API running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});
