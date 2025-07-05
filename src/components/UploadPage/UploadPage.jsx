import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadPage.css";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export default function UploadPage({ setFaceData }) {
  const fileInputRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    setError("");
    setLoading(true);
    const file = e.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG and PNG images are allowed.");
      setLoading(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB.`);
      setLoading(false);
      return;
    }
    // Load face-api.js models and detect face
    try {
      const faceapi = await import("face-api.js");
      await Promise.all([
        await faceapi.nets.ssdMobilenetv1.loadFromUri(
          "/models/ssd_mobilenetv1"
        ),
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68"
        ),
      ]);
      const img = await loadImage(file);
      // Check image dimensions
      if (img.width < 200 || img.height < 200) {
        setError("Image is too small. Minimum size is 200x200 pixels.");
        setLoading(false);
        return;
      }
      if (img.width < 320 || img.height < 320) {
        setError("Recommended image size is 320x320 pixels or higher for best results.");
        // Not returning here, just a warning. You can choose to return if you want to enforce it strictly.
      }

      // Detect face first
      const detections = await faceapi.detectAllFaces(img);
      console.log({ detections });
      if (detections.length === 0) {
        setError("No human face detected.");
        setLoading(false);
        return;
      }
      if (detections.length > 1) {
        setError(
          "Multiple faces detected. Please upload a photo with only one face."
        );
        setLoading(false);
        return;
      }
      // Crop face
      const { box } = detections[0];
      console.log({ box });
      // Blur detection on face region only
      const isBlurry = await checkBlur(img, box);
      if (isBlurry) {
        setError("Image is too blurry. Please upload a clearer photo.");
        setLoading(false);
        return;
      }
      const cropped = cropFace(img, box);
      setFaceData(cropped);
      navigate("/result");
    } catch (e) {
      console.error("Face detection error:", e);
      setError("Face detection failed. Try another image.");
    }
    setLoading(false);
  };

  return (
    <div className="upload-container">
      <h2>Upload Profile Picture</h2>
      <input
        type="file"
        accept="image/jpeg,image/png"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <div className="loading">Detecting face...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function cropFace(img, box) {
  // Add more padding to the face box for a greater zoom out
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

// Utility: Blur detection using variance of Laplacian on face region only
async function checkBlur(img, box) {
  // Create a canvas and draw only the face region
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
  // Get grayscale image data
  const imageData = ctx.getImageData(0, 0, box.width, box.height);
  const gray = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    gray.push(
      0.299 * imageData.data[i] +
        0.587 * imageData.data[i + 1] +
        0.114 * imageData.data[i + 2]
    );
  }
  // Compute Laplacian
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
  // Compute variance
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance =
    laplacian.reduce((a, b) => a + (b - mean) ** 2, 0) / laplacian.length;
  // Threshold: lower variance means more blurry
  return variance < 100; // You can adjust this threshold
}
