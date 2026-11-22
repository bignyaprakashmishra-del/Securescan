// SecureScan — Modular Monolithic Application Server
// Serves REST APIs and Production React Frontend from a single Node/Express instance

require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const scanRoutes = require('./routes/scanRoutes');
const demoRoutes = require('./routes/demoRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const prisma = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for Render / Cloudflare reverse proxy headers
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow Vite inline scripts
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // In production or same-origin requests, origin might be undefined
      if (!origin || !isProduction || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for competition hostnames
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: '100kb' })); // Protect against large payloads
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'securescan-dev-secret'));

// General API rate limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/demo', demoRoutes);

// Production Static Serving
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA Catch-all Fallback (serve index.html for React Router)
app.get('*', (req, res, next) => {
  // If an API route reaches here, return 404 JSON instead of HTML
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `API route ${req.method} ${req.path} not found.` });
  }

  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // In development if client has not been built yet
      res.status(200).send(`
        <html>
          <body style="background:#0b0f19; color:#94a3b8; font-family:sans-serif; text-align:center; padding:50px;">
            <h1 style="color:#06b6d4;">SecureScan API Server Running</h1>
            <p>Vite development client should be accessed at <a href="http://localhost:3000" style="color:#8b5cf6;">http://localhost:3000</a></p>
            <p>Run <code>npm run build</code> to compile the frontend for production single-port serving.</p>
          </body>
        </html>
      `);
    }
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Listen
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  SecureScan Platform Server Initialized`);
  console.log(`📍 Listening on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Production Static Dist: ${clientDistPath}`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection disconnected.');
    process.exit(0);
  });
}

module.exports = app;
