'use client';

import { useState, useCallback } from 'react';
import { ProcessedTemplate } from '@/types';
import GoogleDrivePicker from './GoogleDrivePicker';

interface FileUploadProps {
  onTemplateProcessed: (template: Partial<ProcessedTemplate>) => void;
}

export default function FileUpload({ onTemplateProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      onTemplateProcessed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoogleDriveFile = async (file: { content: string; name: string; mimeType: string }) => {
    setError(null);
    setIsUploading(true);

    try {
      // Convert base64 to blob
      const byteCharacters = atob(file.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.mimeType });
      const fileObject = new File([blob], file.name, { type: file.mimeType });

      // Upload as regular file
      const formData = new FormData();
      formData.append('file', fileObject);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      onTemplateProcessed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Google Drive file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging ? 'border-primary bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".doc,.docx,.rtf,.txt"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <span className="text-lg font-medium text-gray-900">
            {isUploading ? 'Processing...' : 'Drop your document here'}
          </span>
          <p className="mt-2 text-sm text-gray-600">
            or <span className="text-primary hover:text-blue-700 font-medium">browse files</span>
          </p>
        </label>

        <p className="mt-4 text-xs text-gray-500">
          Supported formats: .doc, .docx, .rtf, .txt (max 10MB)
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Google Drive Picker */}
      <GoogleDrivePicker onFileSelected={handleGoogleDriveFile} />
    </div>
  );
}