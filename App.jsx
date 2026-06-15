import { useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/predict";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const acceptedTypes = useMemo(() => ["image/jpeg", "image/png"], []);

  const onFileChosen = (file) => {
    if (!file) {
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG fundus image.");
      setSelectedFile(null);
      setPreviewUrl("");
      setResult(null);
      return;
    }

    setError("");
    setResult(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onInputChange = (event) => {
    const file = event.target.files?.[0];
    onFileChosen(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    onFileChosen(file);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Analysis failed. Please try again.");
      }

      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Automated Fundus Image Screening</h1>
        <p className="subtitle">Upload one fundus image to run AI analysis.</p>

        <div
          className={`upload-zone ${isDragging ? "dragging" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            id="fundus-file"
            className="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={onInputChange}
          />
          <label htmlFor="fundus-file" className="upload-label">
            Drag and drop JPG/PNG image here
            <span className="upload-hint">or click to select</span>
          </label>
        </div>

        {previewUrl ? (
          <div className="preview-wrap">
            <img src={previewUrl} alt="Fundus preview" className="preview-image" />
          </div>
        ) : null}

        <button className="analyze-btn" onClick={onAnalyze} disabled={loading}>
          {loading ? (
            <span className="loading-inline">
              <span className="spinner" />
              Analyzing...
            </span>
          ) : (
            "Start Analysis"
          )}
        </button>

        {error ? <p className="error-text">{error}</p> : null}

        {result ? (
          <div className="result-card">
            <p className="result-label">Predicted Disease</p>
            <p className="result-prediction">{result.prediction}</p>
            <p className="result-confidence">Confidence: {result.confidence}%</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default App;
