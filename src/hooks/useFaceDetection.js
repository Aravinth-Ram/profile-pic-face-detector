import { useState } from "react";
import { loadImage, cropFaceInImage, checkBlur } from "../utils/imageHelpers";
import {
  validateFileTypeAndSize,
  validateImageDimensions,
} from "../utils/faceDetectionHelpers";
import { getFaceApi } from "../utils/faceApiSingleton";

export function useFaceDetection(setFaceData, navigate) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    setError("");
    setLoading(true);
    try {
      const file = e.target.files[0];
      const fileValidation = validateFileTypeAndSize(file);
      if (!fileValidation.valid) {
        setError(fileValidation.error);
        setLoading(false);
        return;
      }
      const img = await loadImage(file);
      const dimValidation = validateImageDimensions(img);
      if (!dimValidation.valid) {
        setError(dimValidation.error);
        setLoading(false);
        return;
      }
      if (dimValidation.warning) {
        setError(dimValidation.warning);
      }
      const faceapi = await getFaceApi();
      const detections = await faceapi.detectAllFaces(img);
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
      const { box } = detections[0];
      const isBlurry = await checkBlur(img, box);
      if (isBlurry) {
        setError("Image is not clear enough. Please upload a clearer photo.");
        setLoading(false);
        return;
      }
      const croppedFace = cropFaceInImage(img, box);
      setFaceData(croppedFace);
      navigate("/result");
    } catch (error) {
      setError("Face detection failed: " + (error?.message || error));
    }
    setLoading(false);
  };

  // New: handle camera capture (dataUrl)
  const handleCameraCapture = async (dataUrl) => {
    setError("");
    setLoading(true);
    try {
      // Convert dataUrl to Image
      const img = await loadImage(await (await fetch(dataUrl)).blob());
      const dimValidation = validateImageDimensions(img);
      if (!dimValidation.valid) {
        setError(dimValidation.error);
        setLoading(false);
        return;
      }
      if (dimValidation.warning) {
        setError(dimValidation.warning);
      }
      const faceapi = await getFaceApi();
      const detections = await faceapi.detectAllFaces(img);
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
      const { box } = detections[0];
      const isBlurry = await checkBlur(img, box);
      if (isBlurry) {
        setError("Image is not clear enough. Please upload a clearer photo.");
        setLoading(false);
        return;
      }
      const croppedFace = cropFaceInImage(img, box);
      setFaceData(croppedFace);
      navigate("/result");
    } catch (error) {
      setError("Face detection failed: " + (error?.message || error));
    }
    setLoading(false);
  };

  return { error, loading, handleFileChange, handleCameraCapture };
}
