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
