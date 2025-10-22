import { useState, useRef } from 'react';
import { Upload, FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface ExtractedText {
    id: string;
    text: string;
    confidence: number;
    timestamp: string;
}

export default function OCRPage() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (file: File) => {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            alert('Please upload an image file (JPG, PNG) or PDF');
            return;
        }

        setUploadedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
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
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleExtractText = async () => {
        if (!uploadedFile) return;

        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            const response = await fetch('http://localhost:5001/api/ocr/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to extract text');
            }

            const result = await response.json();

            const newExtraction: ExtractedText = {
                id: Date.now().toString(),
                text: result.text || 'No text found',
                confidence: result.confidence || 0,
                timestamp: new Date().toISOString()
            };

            setExtractedTexts(prev => [newExtraction, ...prev]);
        } catch (error) {
            console.error('Error extracting text:', error);
            // For demo purposes, add a mock result when backend is not available
            const mockExtraction: ExtractedText = {
                id: Date.now().toString(),
                text: 'This is a mock OCR result. The backend OCR service is not yet implemented.',
                confidence: 0.85,
                timestamp: new Date().toISOString()
            };
            setExtractedTexts(prev => [mockExtraction, ...prev]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = () => {
        setUploadedFile(null);
        setPreviewUrl(null);
        setExtractedTexts([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownloadText = (text: string) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted-text-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">OCR Text Extraction</h1>
                        <p className="text-gray-600">Upload images or PDFs to extract text using OCR technology</p>
                    </div>

                    {uploadedFile && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="flex h-[calc(100vh-140px)] gap-6">
                    {/* Left Panel - Upload and Preview */}
                    <div className="w-1/2 flex flex-col space-y-6 overflow-y-auto">
                        {/* File Upload */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                    ? 'border-purple-400 bg-purple-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Drop your file here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Supports JPG, PNG, and PDF files
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Choose File
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>

                            {uploadedFile && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleExtractText}
                                            disabled={isProcessing}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isProcessing ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <FileText size={16} />
                                            )}
                                            <span>{isProcessing ? 'Processing...' : 'Extract Text'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="bg-white rounded-lg border overflow-scroll border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                                <div className="border border-gray-200 rounded-lg flex justify-center">
                                    {uploadedFile?.type === 'application/pdf' ? (
                                        <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} onLoadError={console.error} >
                                            {Array.from(new Array(numPages), (_, index) => (
                                                <Page
                                                    key={`page_${index + 1}`}
                                                    pageNumber={index + 1}
                                                    width={400}
                                                />
                                            ))}
                                        </Document>
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt="Uploaded file preview"
                                            className="w-full h-auto  object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Panel - Extracted Text */}
                    <div className="w-1/2">
                        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
                                <p className="text-sm text-gray-600">
                                    {extractedTexts.length} extraction{extractedTexts.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {extractedTexts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Extractions Yet</h3>
                                        <p className="text-gray-600">
                                            Upload a document and extract text to see results here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {extractedTexts.map((extraction) => (
                                            <div
                                                key={extraction.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">
                                                            Confidence: {Math.round(extraction.confidence * 100)}%
                                                        </span>
                                                        <span className="text-sm text-gray-500">•</span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(extraction.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadText(extraction.text)}
                                                        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <Download size={14} />
                                                        <span>Download</span>
                                                    </button>
                                                </div>
                                                <div className="bg-gray-50 rounded p-3">
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {extraction.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
