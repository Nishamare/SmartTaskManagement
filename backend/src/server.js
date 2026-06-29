require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB }              = require('./config/db');
const authRoutes                 = require('./routes/authRoutes');
const projectRoutes              = require('./routes/projectRoutes');
const taskRoutes                 = require('./routes/taskRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Security ──────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// ── CORS ──────────────────────────────────
app.use(cors({
  origin:         process.env.CLIENT_URL || 'http://localhost:3000',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parser ───────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logger ────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ──────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success:   true,
    project:   'SmartTaskManagement',
    version:   '1.0.0',
    status:    'running',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);

// ── 404 & Error Handler ───────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║    SmartTaskManagement  –  Backend API    ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`🚀  Server  →  http://localhost:${PORT}`);
    console.log(`🩺  Health  →  http://localhost:${PORT}/health`);
    console.log(`📦  Env     →  ${process.env.NODE_ENV}`);
    console.log('');
  });
};

startServer();