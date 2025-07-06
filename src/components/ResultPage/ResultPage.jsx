import React, { useEffect } from "react";
import "./ResultPage.css";
import { useNavigate } from "react-router-dom";

export default function ResultPage({ faceData }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!faceData) {
      navigate("/", { replace: true });
    }
  }, [faceData, navigate]);

  return (
    <div className="result-container">
      <h2>Your Profile Picture</h2>
      {faceData ? (
        <>
          <img src={faceData} alt="Face Centered" className="face-img" />
          <div className="button-row">
            <button className="back-btn" onClick={() => navigate("/")}>
              Upload Another
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
