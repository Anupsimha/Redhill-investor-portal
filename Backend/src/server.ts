import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import config from './config/env.js';
import { seedData } from './config/seed.js';
import routes from './routes/index.js';

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync(config.UPLOADS_DIR)) {
  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
}

// Ensure database directory exists if custom path provided
const dbDir = path.dirname(config.DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Configure CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin)
    if (!origin) return callback(null, true);

    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Check if origin is explicitly allowed or if wildcard is enabled in dev
    const isAllowed = config.ALLOWED_ORIGINS.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed || !config.IS_PROD) {
      return callback(null, true);
    }

    // In production, reject disallowed origins
    console.warn(`[CORS Blocked] Origin "${origin}" not in allowed list:`, config.ALLOWED_ORIGINS);
    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static Uploads Serving
app.use('/uploads', express.static(config.UPLOADS_DIR));

// Health Check Endpoints (for Render and uptime monitors)
const healthCheckHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'redhill-backend',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// Initialize Database Seed Data
try {
  seedData();
} catch (err) {
  console.error('Database seeding failed:', err);
}

// Register Routes
app.use(routes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.IS_PROD ? {} : { stack: err.stack }),
  });
});

// Start Server
app.listen(config.PORT, config.HOST, () => {
  console.log(`=============================================`);
  console.log(`🚀 Redhill Backend running in [${config.NODE_ENV}] mode`);
  console.log(`🌐 Server address: http://${config.HOST}:${config.PORT}`);
  console.log(`🔒 Allowed CORS Origins:`, config.ALLOWED_ORIGINS);
  console.log(`📁 Uploads Directory: ${config.UPLOADS_DIR}`);
  console.log(`🗄️ Database Path: ${config.DATABASE_PATH}`);
  console.log(`=============================================`);
});

export default app;
