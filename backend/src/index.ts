import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './src/lib/prisma';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/auth';
import familyRoutes from './src/routes/families';
import flightRoutes from './src/routes/flights';
import hotelRoutes from './src/routes/hotels';
import attractionRoutes from './src/routes/attractions';
import timelineRoutes from './src/routes/timeline';
import budgetRoutes from './src/routes/budget';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/budget', budgetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 TripFamily API running on port ${PORT}`);
});

export { app, prisma };
