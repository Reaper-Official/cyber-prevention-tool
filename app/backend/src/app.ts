import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';
import trackingRoutes from './routes/trackingRoutes';
import userRoutes from './routes/userRoutes';
import departmentRoutes from './routes/departmentRoutes';
import importRoutes from './routes/importRoutes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/import', importRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;