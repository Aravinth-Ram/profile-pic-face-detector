import React, { useRef, useState, useCallback } from "react";
import "./UploadPage.css";

const CameraModal = ({ onCapture, onClose, loading }) => {
  const videoRef = useRef();
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopCamera = useCallback(() => {
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
            track.enabled = false;
          }
        });
        streamRef.current = null;
      }
      if (window.gc) window.gc();
    } catch (error) {
      // eslint-disable-next-line
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsInitializing(true);
      stopCamera();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve();
        });
      }
      setIsInitializing(false);
    } catch (error) {
      setCameraError(error.message);
      setIsInitializing(false);
      setTimeout(() => onClose(), 2000);
    }
  }, [stopCamera, onClose]);

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      setTimeout(() => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            if (track.readyState === "live") track.stop();
          });
          streamRef.current = null;
        }
      }, 100);
    };
  }, [startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setTimeout(() => onCapture(dataUrl), 0);
    } catch (error) {
      setCameraError("Failed to capture photo");
    }
  }, [onCapture]);

  const handleCancel = useCallback(() => {
    setTimeout(() => onClose(), 0);
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setCameraError(null);
    startCamera();
  }, [startCamera]);

  if (cameraError) {
    return (
      <div className="camera-modal-overlay">
        <div className="camera-modal">
          <div className="camera-error">
            <p>Camera Error: {cameraError}</p>
            <div className="camera-modal-actions">
              <button className="camera-btn" onClick={handleRetry}>
                Retry
              </button>
              <button className="camera-btn cancel" onClick={handleCancel}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-modal-overlay">
      <div className="camera-modal">
        {isInitializing ? (
          <div className="camera-loading">
            <p>Initializing camera...</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            <div className="camera-modal-actions">
              <button
                className="camera-btn"
                onClick={handleCapture}
                disabled={loading || isInitializing}
              >
                {loading ? "Processing..." : "Capture"}
              </button>
              <button
                className="camera-btn cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraModal;
