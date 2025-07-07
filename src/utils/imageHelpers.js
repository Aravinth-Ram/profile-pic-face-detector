// Utility functions for image processing

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    try {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = (err) =>
        reject(new Error("Failed to load image: " + (err?.message || err)));
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(
        new Error(
          "Unexpected error loading image: " + (error?.message || error)
        )
      );
    }
  });
}

export function cropFaceInImage(img, box) {
  const padding = 0.6; // 60% padding for more zoom out
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const newWidth = box.width * (1 + padding);
  const newHeight = box.height * (1 + padding);
  const newX = Math.max(0, centerX - newWidth / 2);
  const newY = Math.max(0, centerY - newHeight / 2);

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    img,
    newX,
    newY,
    newWidth,
    newHeight,
    0,
    0,
    newWidth,
    newHeight
  );
  return canvas.toDataURL("image/jpeg");
}

export async function checkBlur(img, box) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = box.width;
    canvas.height = box.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height
    );
    const imageData = ctx.getImageData(0, 0, box.width, box.height);
    const gray = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      gray.push(
        0.299 * imageData.data[i] +
          0.587 * imageData.data[i + 1] +
          0.114 * imageData.data[i + 2]
      );
    }
    const laplacian = [];
    const w = box.width;
    const h = box.height;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const lap =
          -gray[idx - w] -
          gray[idx - 1] +
          4 * gray[idx] -
          gray[idx + 1] -
          gray[idx + w];
        laplacian.push(lap);
      }
    }
    const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
    const variance =
      laplacian.reduce((a, b) => a + (b - mean) ** 2, 0) / laplacian.length;
    return variance < 100;
  } catch (error) {
    throw new Error("Error checking image blur: " + (error?.message || error));
  }
}
