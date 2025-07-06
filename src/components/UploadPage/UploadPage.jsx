import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadPage.css";
import { useFaceDetection } from "../../hooks/useFaceDetection";

export default function UploadPage({ setFaceData }) {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { error, loading, handleFileChange } = useFaceDetection(
    setFaceData,
    navigate
  );

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
