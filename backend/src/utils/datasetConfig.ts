import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from './logger';

export function verifyDatasetExists(): boolean {
  // Resolve the path relative to the backend directory
  const datasetPath = path.resolve(process.cwd(), env.REVIEW_DATASET_PATH);
  
  if (!fs.existsSync(datasetPath)) {
    logger.error(`Dataset not found at configured path: ${datasetPath}. Please ensure the file exists or update REVIEW_DATASET_PATH in your .env file.`);
    return false;
  }
  
  logger.info(`Dataset verified at: ${datasetPath}`);
  return true;
}

export function getDatasetPath(): string {
  return path.resolve(process.cwd(), env.REVIEW_DATASET_PATH);
}
