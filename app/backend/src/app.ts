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

export const app = express();

app.set('trust proxy', 1); // <-- Ajoutez cette ligne

app.use(helmet());
app.use(cors());
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

app.use(errorHandler);

export default app;