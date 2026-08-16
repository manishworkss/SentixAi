import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  logger.info(`🚀 SentixAI Backend (Phase 1) running at http://localhost:${PORT}`);
  logger.info(`   GET /api/health → Health check`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
