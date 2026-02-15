import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

/**
 * Read data from a JSON file
 * @param {string} filename
 * @returns {Promise<Array>}
 */
export const readJson = async (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return [];
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

/**
 * Write data to a JSON file
 * @param {string} filename
 * @param {Array|Object} data
 */
export const writeJson = async (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    // Ensure directory exists
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

export default { readJson, writeJson };
