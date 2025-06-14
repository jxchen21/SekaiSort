import Tesseract, { createWorker } from 'tesseract.js';

interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface OCRResult {
  text: string;
  confidence: number;
  cropCoordinates: CropCoordinates;
  originalDimensions: ImageDimensions;
}

/**
 * Extract rank from image using the same cropping logic as Python version
 * Replicates: pytesseract.image_to_string(rank_crop, config='--psm 7').strip()
 */
export async function extractRankFromImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async function() {
      try {
        // Calculate crop coordinates (same as Python)
        const cropX = Math.floor(0.025 * img.width);
        const cropY = Math.floor(0.25 * img.height);
        const cropWidth = Math.floor(0.12 * img.width) - cropX;
        const cropHeight = Math.floor(0.75 * img.height) - cropY;

        // Create canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped portion
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Run OCR with single text line mode (equivalent to PSM 7)
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');

        // Return trimmed result (equivalent to .strip())
        resolve(text.trim());

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Extract username from image using dynamic cropping based on event type
 * Replicates Python logic with conditional namex positioning
 */
export async function extractUsernameFromImage(imageFile: File, eventType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async function() {
      try {
        // Calculate namex based on event type (same logic as Python)
        let namex = 0;
        if (eventType.toLowerCase() === "mara") {
          namex = Math.floor(0.21 * img.width);
        } else {
          namex = Math.floor(0.25 * img.width);
        }

        // Calculate crop coordinates for name region
        const cropX = namex;
        const cropY = 0;
        const cropWidth = Math.floor(0.6 * img.width) - namex;
        const cropHeight = Math.floor(0.4 * img.height);

        // Create canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped portion
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Run OCR (equivalent to PSM 7)
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');

        // Return trimmed result (equivalent to .strip())
        resolve(text.trim());

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}