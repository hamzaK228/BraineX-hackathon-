import Bull from 'bull';
import logger from '../config/logger.js';
import { sendWelcomeEmail, sendApplicationConfirmation } from '../utils/emailService.js';

/**
 * Background job queues for async processing
 */

// Email queue
export const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

// Process email jobs
emailQueue.process(async (job) => {
  const { type, data } = job.data;

  logger.info(`Processing email job: ${type}`, { jobId: job.id });

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(data.user);
        break;
      case 'application':
        await sendApplicationConfirmation(data.user, data.scholarship);
        break;
      default:
        logger.warn(`Unknown email type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Email job failed:', error);
    throw error;
  }
});

// Data processing queue
export const dataQueue = new Bull('data-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process data jobs
dataQueue.process(async (job) => {
  const { type, data } = job.data;

  logger.info(`Processing data job: ${type}`, { jobId: job.id });

  try {
    switch (type) {
      case 'generate-report':
        // Add report generation logic
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
        break;
      case 'sync-data':
        // Add data synchronization logic
        await new Promise((resolve) => setTimeout(resolve, 500));
        break;
      default:
        logger.warn(`Unknown data job type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Data job failed:', error);
    throw error;
  }
});

// Job event listeners
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job completed: ${job.id}`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job failed: ${job.id}`, err);
});

dataQueue.on('completed', (job, result) => {
  logger.info(`Data job completed: ${job.id}`);
});

dataQueue.on('failed', (job, err) => {
  logger.error(`Data job failed: ${job.id}`, err);
});

/**
 * Add email to queue
 */
export const queueEmail = async (type, data) => {
  return await emailQueue.add(
    { type, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );
};

/**
 * Add data processing job to queue
 */
export const queueDataJob = async (type, data) => {
  return await dataQueue.add({ type, data });
};

/**
 * Graceful shutdown
 */
export const closeQueues = async () => {
  await emailQueue.close();
  await dataQueue.close();
  logger.info('Job queues closed');
};

export default {
  emailQueue,
  dataQueue,
  queueEmail,
  queueDataJob,
  closeQueues,
};
