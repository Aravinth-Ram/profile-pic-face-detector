import { useRef, useState, useCallback } from "react";
import "./UploadPage.css";
import CameraModal from "./CameraModal";
import { useNavigate } from "react-router-dom";
import { useFaceDetection } from "../../hooks/useFaceDetection";

export default function UploadPage({ setFaceData }) {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { error, loading, handleFileChange, handleCameraCapture } =
    useFaceDetection(setFaceData, navigate);
  const [showCamera, setShowCamera] = useState(false);

  const handleTakePhoto = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleCameraModalCapture = useCallback(
    (dataUrl) => {
      setShowCamera(false);
      setTimeout(() => {
        handleCameraCapture(dataUrl);
      }, 100);
    },
    [handleCameraCapture]
  );

  const handleCameraModalClose = useCallback(() => {
    setShowCamera(false);
  }, []);

  return (
    <div className="upload-container">
      <h2>Upload Profile Picture</h2>
      <div className="upload-actions">
        <label className="camera-btn" tabIndex={0}>
          Upload Picture
          <input
            type="file"
            accept="image/jpeg,image/png"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: "none" }}
          />
        </label>
        <button
          className="camera-btn"
          onClick={handleTakePhoto}
          disabled={loading}
        >
          Take Photo
        </button>
      </div>
      {showCamera && (
        <CameraModal
          onCapture={handleCameraModalCapture}
          onClose={handleCameraModalClose}
          loading={loading}
        />
      )}
      {loading && <div className="loading">Detecting face...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
