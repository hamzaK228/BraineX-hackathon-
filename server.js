/* eslint-disable */
import express from 'express';
console.log('DEBUG: server.js loaded, starting imports...');
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import {
  securityHeaders,
  rateLimiter,
  authLimiter,
  corsOptions,
  sanitize,
} from './backend/middleware/security.js';
import { errorHandler, notFoundHandler } from './backend/middleware/errorHandler.js';
import { authenticate, authorize } from './backend/middleware/auth.js';

// Import routes
import authRoutes from './backend/routes/auth.js';
import scholarshipRoutes from './backend/routes/scholarships.js';
import mentorRoutes from './backend/routes/mentors.js';
import fieldRoutes from './backend/routes/fields.js';
import eventRoutes from './backend/routes/events.js';
import projectRoutes from './backend/routes/projects.js';
import goalRoutes from './backend/routes/goals.js';
import notionRoutes from './backend/routes/notion.js';
import roadmapRoutes from './backend/routes/roadmaps.js';
import adminRoutes from './backend/routes/admin.js';
import universityRoutes from './backend/routes/universities.js';
import programRoutes from './backend/routes/programs.js';

// Import database and logger
import { testConnection, closePool } from './backend/config/database.js';
import logger from './backend/config/logger.js';
import { initializeSocketIO } from './backend/config/socket.js';
// import { closeQueues } from './backend/config/queue.js';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
import { validateEnvironment } from './backend/utils/envValidator.js';
try {
  validateEnvironment();
} catch (error) {
  logger.warn('Environment validation failed, but proceeding for fallback mode:', error);
  // process.exit(1);
}

const app = express();
const PORT = 3001; // Forced for stability

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(compression());

// Logging middleware
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization
app.use(sanitize);

// Serve static files with caching
app.use(
  express.static(path.join(__dirname, 'frontend'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Long cache for assets
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      }
      // Short cache for HTML
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);
app.use(
  '/assets',
  express.static(path.join(__dirname, 'frontend/public/assets'), {
    maxAge: 0,
    etag: true,
  })
);
app.use(
  '/data',
  express.static(path.join(__dirname, 'backend/data'), {
    maxAge: '1h',
  })
);

// Service Worker - must be at root with correct scope
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'frontend/sw.js'));
});

// Offline page
app.get('/offline.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/offline.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({
    success: true,
    csrfToken: 'csrf-token-placeholder',
  });
});

// API routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/scholarships', rateLimiter, scholarshipRoutes);
app.use('/api/mentors', rateLimiter, mentorRoutes);
app.use('/api/fields', rateLimiter, fieldRoutes);
app.use('/api/events', rateLimiter, eventRoutes);
app.use('/api/projects', rateLimiter, projectRoutes);
app.use('/api/goals', rateLimiter, goalRoutes);
app.use('/api/notion', rateLimiter, notionRoutes);
app.use('/api/roadmaps', rateLimiter, roadmapRoutes);
app.use('/api/admin', rateLimiter, adminRoutes);
app.use('/api/universities', rateLimiter, universityRoutes);
app.use('/api/programs', rateLimiter, programRoutes);

// Frontend routes - serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/main.html'));
});

app.get('/fields', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/fields.html'));
});

app.get('/universities', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/universities.html'));
});

app.get('/programs', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/programs.html'));
});

app.get('/pathways/:field', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/pathway.html'));
});

app.get('/scholarships', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/scholarships.html'));
});

app.get('/mentors', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/mentors.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/projects.html'));
});

app.get('/roadmaps', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/roadmaps.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/events.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/about.html'));
});

app.get('/notion', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/notion.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/pages/admin.html'));
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.warn('Failed to connect to database. API endpoints will use JSON fallback mode.');
      // Do not exit, allow server to verify JSON fallbacks
    }

    // Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 BraineX server running on port ${PORT} (Bound to 0.0.0.0)`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔒 Security: Helmet, CORS, Rate Limiting, XSS Protection enabled`);

      // Initialize Socket.IO
      try {
        initializeSocketIO(server);
      } catch (ioError) {
        logger.error('Failed to initialize Socket.IO:', ioError);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `Port ${PORT} is already in use. Please kill the process or use a different port.`
        );
      } else {
        logger.error('Server error:', err);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await closePool();
        // await closeQueues(); // Disabled for verification

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Global error handlers
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if not running in Vercel environment
if (process.env.VERCEL !== '1') {
  startServer();
}
// console.log('Server file loaded successfully, but startServer disabled.');

export default app;
