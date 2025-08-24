import App from './app';
import logger from './services/LoggerService';

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  // Log error and continue (in production, you might want to restart the process)
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log error and continue (in production, you might want to restart the process)
});

// Start the application
async function startApp() {
  try {
    const app = new App();
    await app.start();

    logger.info('AI-Powered D&D Game Backend started successfully');
    logger.info('Press Ctrl+C to stop the server');
  } catch (error) {
    logger.error('Failed to start application:', error);
    throw error;
  }
}

// Start the application
startApp();
