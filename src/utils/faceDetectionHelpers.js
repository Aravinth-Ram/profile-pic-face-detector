import {
  MAX_FILE_SIZE_MB,
  ACCEPTED_TYPES,
  MIN_WIDTH,
  MIN_HEIGHT,
  RECOMMENDED_WIDTH,
  RECOMMENDED_HEIGHT,
} from "../config/uploadConfig";

export function validateFileTypeAndSize(file) {
  if (!file) return { valid: false, error: null };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG and PNG images are allowed." };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE_MB}MB.`,
    };
  }
  return { valid: true };
}

export function validateImageDimensions(img) {
  if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
    return {
      valid: false,
      error: `Image is too small. Minimum size is ${MIN_WIDTH}x${MIN_HEIGHT} pixels.`,
    };
  }
  if (img.width < RECOMMENDED_WIDTH || img.height < RECOMMENDED_HEIGHT) {
    return {
      valid: true,
      warning: `Recommended image size is ${RECOMMENDED_WIDTH}x${RECOMMENDED_HEIGHT} pixels or higher for best results.`,
    };
  }
  return { valid: true };
}
