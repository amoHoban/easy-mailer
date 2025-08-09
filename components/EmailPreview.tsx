'use client';

import { useState, useEffect } from 'react';

interface EmailPreviewProps {
  templateId: string;
  variables: Record<string, string>;
  template?: any;
}

export default function EmailPreview({ templateId, variables, template }: EmailPreviewProps) {
  const [preview, setPreview] = useState<{ html: string; plainText: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');

  useEffect(() => {
    if (template) {
      fetchPreview();
    }
  }, [template, variables]);

  const fetchPreview = async () => {
    if (!template) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/template/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, variables }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!preview) {
    return (
      <div className="text-center py-8 text-gray-500">
        No preview available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'html'
              ? 'bg-white text-primary border-b-2 border-primary'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          HTML Preview
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-white text-primary border-b-2 border-primary'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Plain Text
        </button>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'html' ? (
              <div 
                dangerouslySetInnerHTML={{ __html: preview.html }}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                {preview.plainText}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}