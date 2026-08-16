import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import legacyRoutes from './routes/legacy.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', legacyRoutes);

// Unknown route handler (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND'
  });
});

// Global Error Handler (must be after all routes)
app.use(errorHandler);

export default app;
