import React, { useState } from "react";
import axios from "axios";

export default function RPS() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prediction, setPrediction] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Format file tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File terlalu besar. Maksimal 10MB");
      return;
    }
    setFile(selectedFile);
    setError("");
    setPrediction(null);
    setSuccess("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Silakan pilih gambar terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    setPrediction(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        "https://web-production-16cb4.up.railway.app/predict",
        formData
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess("Gambar berhasil diproses!");
        const data = response.data;
        const map = {
          rock: "Batu",
          paper: "Kertas",
          scissors: "Gunting",
        };
        const predictionLabel = data.prediction?.toLowerCase() || "unknown";
        const result = map[predictionLabel] || data.prediction;
        setPrediction({
          result,
          confidence: data.confidence || 0,
          raw: data,
        });
      } else {
        setError("Gagal memproses gambar");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan saat memproses gambar. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview("");
    setPrediction(null);
    setError("");
    setSuccess("");
    document.getElementById("imageInput").value = "";
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h2 className="fw-bold mb-1">Prediksi Gunting Batu Kertas</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="imageInput" className="form-label fw-semibold">
                Pilih Gambar
              </label>
              <div
                className="border rounded bg-light p-4 text-center"
                style={{
                  borderStyle: "dashed",
                  minHeight: "220px",
                  background: "#f8fafc",
                }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="img-thumbnail mb-3"
                    style={{
                      maxWidth: "280px",
                      maxHeight: "280px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="py-4 text-muted">
                    <i className="bi bi-cloud-arrow-up fs-1 mb-3 d-block"></i>
                    Masukkan gambar tangan
                  </div>
                )}
                <input
                  type="file"
                  className="d-none"
                  id="imageInput"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                />
                <hr />
                <label htmlFor="imageInput" className="btn btn-dark me-2 px-4">
                  {preview ? "Ganti Gambar" : "Upload Gambar"}
                </label>
                {preview && (
                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={handleReset}>
                    Hapus
                  </button>
                )}
              </div>
              <div className="form-text mt-2">
                Format: JPG, PNG, WebP • Maksimal 10MB
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-3 fw-semibold"
              disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Memproses...
                </>
              ) : (
                <>Identifikasi Gambar</>
              )}
            </button>
          </form>
        </div>
      </div>

      {prediction && (
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-header bg-dark text-white fw-semibold">
            Hasil Prediksi
          </div>
          <div className="card-body">
            <div className="mb-4">
              <div className="fs-1 fw-bold text-dark">{prediction.result}</div>
            </div>
            <div className="progress mb-3" style={{ height: "25px" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${prediction.confidence * 100}%` }}>
                {(prediction.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div className="mt-4">
              <h6 className="fw-bold mb-2">Response Data:</h6>
              <div className="bg-light border rounded p-3">
                <pre className="mb-0 small">
                  {JSON.stringify(prediction.raw, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
