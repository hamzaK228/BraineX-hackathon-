import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import logger from '../config/logger.js';

/**
 * Image optimization utilities using Sharp
 */

const OPTIMIZED_DIR = 'uploads/optimized';

/**
 * Optimize uploaded image
 */
export const optimizeImage = async (inputPath, options = {}) => {
  try {
    const { width = 1920, height = null, quality = 80, format = 'webp' } = options;

    // Create optimized directory if it doesn't exist
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(OPTIMIZED_DIR, `${filename}.${format}`);

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    logger.info(`Image optimized: ${outputPath}`);

    return {
      success: true,
      path: outputPath,
      format,
    };
  } catch (error) {
    logger.error('Image optimization failed:', error);
    throw error;
  }
};

/**
 * Generate responsive image variants
 */
export const generateResponsiveImages = async (inputPath, sizes = [320, 640, 768, 1024, 1920]) => {
  const variants = [];

  for (const size of sizes) {
    try {
      const variant = await optimizeImage(inputPath, {
        width: size,
        format: 'webp',
      });

      variants.push({
        size,
        ...variant,
      });
    } catch (error) {
      logger.error(`Failed to generate ${size}px variant:`, error);
    }
  }

  return variants;
};

/**
 * Generate thumbnail
 */
export const generateThumbnail = async (inputPath, size = 150) => {
  try {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(OPTIMIZED_DIR, `${filename}_thumb.webp`);

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('webp', { quality: 70 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    logger.error('Thumbnail generation failed:', error);
    throw error;
  }
};

export default {
  optimizeImage,
  generateResponsiveImages,
  generateThumbnail,
};
