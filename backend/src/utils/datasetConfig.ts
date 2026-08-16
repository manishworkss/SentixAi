import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from './logger';

export function verifyDatasetExists(): boolean {
  try {
    getDatasetPath();
    return true;
  } catch (error: any) {
    logger.error(error.message);
    return false;
  }
}

export function getDatasetPath(): string {
  // path.resolve predictably handles both absolute paths and relative paths
  const datasetPath = path.resolve(process.cwd(), env.REVIEW_DATASET_PATH);
  
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Dataset not found at configured path: ${datasetPath}. Please ensure the file exists or update REVIEW_DATASET_PATH in your .env file.`);
  }

  return datasetPath;
}
