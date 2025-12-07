import { useState, useRef } from 'react';
import { Upload, X, RefreshCw } from 'lucide-react';
import FilePreview from './FilePreview';
import UploadButton from './UploadButton';
import UploadFeedback from './UploadFeedback';

interface FileUploadProps {
  darkMode: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface Document {
  id: number;
  fileName: string;
  status: string;
  extractedText: string | null;
  uploadDate: string;
}

export default function FileUpload({ darkMode }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = 'http://localhost:9090/api/documents';
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setDocument(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setDocument(data);
      setUploadStatus('success');

      // Auto-refresh après 3 secondes pour récupérer le texte extrait
      setTimeout(() => {
        refreshDocument(data.id);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }
  };

  const refreshDocument = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();
      setDocument(data);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = () => {
    setUploadStatus('idle');
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-8">
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragActive
                  ? darkMode
                    ? 'border-blue-400 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : darkMode
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />

              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Upload size={48} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                </div>

                <div>
                  <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Drag & drop your file here
                  </p>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    or
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } shadow-lg`}
                  >
                    Browse Files
                  </button>
                </div>

                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Supported formats: JPG, PNG, GIF, WEBP (Max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`flex items-start justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <FilePreview
                    file={selectedFile}
                    previewUrl={previewUrl}
                    darkMode={darkMode}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedFile.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {selectedFile.type}
                    </p>
                  </div>
                </div>

                {uploadStatus !== 'uploading' && (
                  <button
                    onClick={handleRemove}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="Remove file"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <UploadFeedback
                status={uploadStatus}
                darkMode={darkMode}
                onRetry={handleRetry}
              />

              <UploadButton
                status={uploadStatus}
                onUpload={handleUpload}
                darkMode={darkMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Résultat OCR */}
      {document && (
        <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📄 OCR Result
            </h2>
            {document.id && (
              <button
                onClick={() => refreshDocument(document.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                File Name
              </p>
              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {document.fileName}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Status
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                document.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                document.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                document.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {document.status}
              </span>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🔍 Extracted Text:
            </h3>
            {document.status === 'PENDING' && (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ⏳ Waiting for processing...
              </p>
            )}
            {document.status === 'PROCESSING' && (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ⚙️ Processing... Click refresh in a few seconds.
              </p>
            )}
            {document.status === 'ERROR' && (
              <p className="text-red-500">
                ❌ Error during OCR processing.
              </p>
            )}
            {document.status === 'COMPLETED' && (
              <pre className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} whitespace-pre-wrap font-mono text-sm leading-relaxed`}>
                {document.extractedText || 'No text found in image'}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}