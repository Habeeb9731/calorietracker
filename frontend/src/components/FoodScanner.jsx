import { useRef, useState } from 'react';
import api from '../services/api';

export default function FoodScanner({ onResult }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload and analyze
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/analyze-food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Food analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const clear = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center
                     cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-200"
        >
          <div className="text-4xl mb-3">📸</div>
          <p className="font-medium text-gray-700">Drop an image or click to upload</p>
          <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP — max 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Food preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={clear}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7
                       flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ×
          </button>
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-medium text-sm">Analyzing food...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-secondary w-full text-sm"
        type="button"
      >
        📷 Take Photo / Choose Image
      </button>
    </div>
  );
}
