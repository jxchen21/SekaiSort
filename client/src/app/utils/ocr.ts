import Tesseract from 'tesseract.js';

/**
 * Check if image contains a crown by calling the server endpoint
 */
const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL;
//const API_BASE_URL = "https://sekai-sort-server.up.railway.app"
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

    img.onload = async function() {
      try {
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
        let ocrConfig = 'eng'; // Default Tesseract config

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

        // Run OCR with appropriate configuration
        let tesseractOptions: any = {};
        if (hasCrown) {
          tesseractOptions = {
            tessedit_pageseg_mode: '10', // Single character (PSM 10)
            tessedit_char_whitelist: '123'
          };
        } else {
          tesseractOptions = {
            tessedit_pageseg_mode: '7' // Single text line (PSM 7)
          };
        }

        // Run OCR with appropriate configuration
        const { data: { text } } = await Tesseract.recognize(finalCanvas, ocrConfig, tesseractOptions);
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
        resolve(text.trim().replace(/\s+/g, ''));

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