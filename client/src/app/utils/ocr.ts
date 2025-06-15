import { createWorker, Worker, PSM } from 'tesseract.js';
/**
 * Check if image contains a crown by calling the server endpoint
 */
//const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = "https://sekai-sort-server.up.railway.app"

// Global worker instance for reuse
let worker: Worker | null = null;

/**
 * Initialize Tesseract worker
 */
async function initializeWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
}

/**
 * Cleanup worker when done
 */
export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

/**
 * Crown detection function
 */
async function detectCrown(imageFile: File): Promise<boolean> {
  console.log("Checking for crown");
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    // Call the crown detection endpoint
    const response = await fetch(`${API_BASE_URL}/api/detect-crown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64 })
    });

    if (!response.ok) {
      throw new Error('Crown detection request failed');
    }

    const result = await response.json();
    console.log("Crown found: " + result.hasCrown);
    return result.hasCrown;
  } catch (error) {
    console.error('Crown detection failed:', error);
    // Default to false if detection fails
    return false;
  }
}

/**
 * Extract rank from image using the same cropping logic as Python version
 * Replicates: pytesseract.image_to_string(rank_crop, config='--psm 7').strip()
 */
export async function extractRankFromImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async function(): Promise<void> {
      try {
        // Initialize worker
        const tesseractWorker = await initializeWorker();

        // First detect if there's a crown
        const hasCrown = await detectCrown(imageFile);
        console.log(hasCrown ? "Crown detected" : "No crown detected");

        // Calculate initial crop coordinates (same as Python)
        const cropX = Math.floor(0.025 * img.width);
        const cropY = Math.floor(0.25 * img.height);
        const cropWidth = Math.floor(0.12 * img.width) - cropX;
        const cropHeight = Math.floor(0.75 * img.height) - cropY;

        // Create canvas for initial cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw initial cropped portion
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        let finalCanvas = canvas;

        if (hasCrown) {
          // Crown detected - crop to center area where number appears in crown
          // Replicating: number_crop = rank_crop.crop((crown_w * 0.3, crown_h * 0.3, crown_w * 0.7, crown_h))
          const crownNumberX = Math.floor(cropWidth * 0.3);
          const crownNumberY = Math.floor(cropHeight * 0.4);
          const crownNumberWidth = Math.floor(cropWidth * 0.6) - crownNumberX;
          const crownNumberHeight = cropHeight - crownNumberY;

          // Create new canvas for crown number crop
          const crownCanvas = document.createElement('canvas');
          const crownCtx = crownCanvas.getContext('2d');

          if (!crownCtx) {
            throw new Error('Could not get crown canvas context');
          }

          crownCanvas.width = crownNumberWidth;
          crownCanvas.height = crownNumberHeight;

          // Draw the crown number area
          crownCtx.drawImage(
            canvas,
            crownNumberX, crownNumberY, crownNumberWidth, crownNumberHeight,
            0, 0, crownNumberWidth, crownNumberHeight
          );

          finalCanvas = crownCanvas;
        }

        // Set OCR parameters based on crown detection
        if (hasCrown) {
          await tesseractWorker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_CHAR, // Single character (PSM 10)
            tessedit_char_whitelist: '123'
          });
        } else {
          await tesseractWorker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_LINE // Single text line (PSM 7)
          });
        }

        // Run OCR recognition
        const { data: { text } } = await tesseractWorker.recognize(finalCanvas);

        // Return trimmed result (equivalent to .strip())
        resolve(text.trim());

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (): void => reject(new Error('Failed to load image'));

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (): void => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Extract username from image using dynamic cropping based on event type
 * Replicates Python logic with conditional namex positioning
 */
export async function extractUsernameFromImage(
  imageFile: File,
  eventType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async function(): Promise<void> {
      try {
        // Initialize worker
        const tesseractWorker = await initializeWorker();

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

        // Set OCR parameters for username recognition (equivalent to PSM 7)
        await tesseractWorker.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_LINE // Single text line
        });

        // Run OCR recognition
        const { data: { text } } = await tesseractWorker.recognize(canvas);

        // Return trimmed result with whitespace removed (equivalent to .strip())
        resolve(text.trim().replace(/\s+/g, ''));

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (): void => reject(new Error('Failed to load image'));

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (): void => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}
