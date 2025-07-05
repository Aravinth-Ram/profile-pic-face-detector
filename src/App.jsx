import React, { useState } from "react";
import UploadPage from "./components/UploadPage/UploadPage";
import ResultPage from "./components/ResultPage/ResultPage";
import "./App.css";
import { Routes, Route } from "react-router-dom";

function App() {
  const [faceData, setFaceData] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<UploadPage setFaceData={setFaceData} />} />
      <Route path="/result" element={<ResultPage faceData={faceData} />} />
    </Routes>
  );
}

export default App;
