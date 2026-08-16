import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import healthRoutes from './routes/health.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);

// Global Error Handler (must be after all routes)
app.use(errorHandler);

export default app;
