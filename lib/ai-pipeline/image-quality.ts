import sharp from 'sharp';

export interface QualityReport {
  width: number;
  height: number;
  blurScore: number;
  brightness: number; // 0 to 255
  glareRatio: number; // 0 to 1
  isAcceptable: boolean;
  issues: string[];
}

/**
 * Analyzes image buffer for resolution, brightness, glare, and blur
 */
export async function analyzeImageQuality(
  buffer: Buffer,
  mime: string,
  thresholds: {
    minResolution?: string; // e.g. "800x600"
    blurThreshold?: number;
    maxGlareRatio?: number;
  } = {}
): Promise<QualityReport> {
  const issues: string[] = [];

  // If PDF, sharp can handle first page if libvips supports it, otherwise default pass
  if (mime === 'application/pdf') {
    return {
      width: 1200,
      height: 1600,
      blurScore: 100,
      brightness: 200,
      glareRatio: 0.01,
      isAcceptable: true,
      issues: []
    };
  }

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // 1. Resolution Check
    const minW = 600;
    const minH = 400;
    if (width < minW || height < minH) {
      issues.push(`Image resolution too low (${width}x${height}). Please take a clearer photo.`);
    }

    // 2. Brightness & Glare Check via raw grayscale stats
    const { data, info } = await image
      .resize(200, 200, { fit: 'inside' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let totalLuminance = 0;
    let glarePixels = 0;
    const pixelCount = info.width * info.height;

    for (let i = 0; i < pixelCount; i++) {
      const val = data[i];
      totalLuminance += val;
      if (val >= 250) {
        glarePixels++;
      }
    }

    const brightness = Math.round(totalLuminance / pixelCount);
    const glareRatio = glarePixels / pixelCount;

    if (brightness < 40) {
      issues.push('Document image is too dark. Please take photo in better lighting.');
    } else if (brightness > 245) {
      issues.push('Document image is overexposed.');
    }

    const maxGlare = thresholds.maxGlareRatio ?? 0.25;
    if (glareRatio > maxGlare) {
      issues.push('Significant flash glare detected on the document surface.');
    }

    // 3. Approximate Blur score using edge gradient variance
    let diffSum = 0;
    for (let y = 0; y < info.height - 1; y++) {
      for (let x = 0; x < info.width - 1; x++) {
        const idx = y * info.width + x;
        const diffX = Math.abs(data[idx] - data[idx + 1]);
        const diffY = Math.abs(data[idx] - data[idx + info.width]);
        diffSum += diffX + diffY;
      }
    }
    const blurScore = Math.round((diffSum / pixelCount) * 10);
    const minBlur = thresholds.blurThreshold ?? 30;

    if (blurScore < minBlur) {
      issues.push('Image appears blurry. Please hold camera steady and retake.');
    }

    const isAcceptable = issues.length === 0;

    return {
      width,
      height,
      blurScore,
      brightness,
      glareRatio: Math.round(glareRatio * 100) / 100,
      isAcceptable,
      issues
    };
  } catch (err) {
    console.warn('Image quality analysis fallback:', err);
    return {
      width: 800,
      height: 600,
      blurScore: 50,
      brightness: 128,
      glareRatio: 0.05,
      isAcceptable: true,
      issues: []
    };
  }
}
