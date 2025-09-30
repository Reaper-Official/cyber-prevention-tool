import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import campaignRoutes from './routes/campaigns.js';
import trackingRoutes from './routes/tracking.js';
import trainingRoutes from './routes/training.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import templateRoutes from './routes/templates.js';
import quizRoutes from './routes/quiz.js';
import gamificationRoutes from './routes/gamification.js';
import notificationRoutes from './routes/notifications.js';

export const app = express();

app.set('trust proxy', 1);

// Configuration CORS permissive pour le développement
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

export default app;