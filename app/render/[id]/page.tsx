'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProcessedTemplate } from '@/types';
import VariableForm from '@/components/VariableForm';
import EmailPreview from '@/components/EmailPreview';
import ActionButtons from '@/components/ActionButtons';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function RenderPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<ProcessedTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const templateId = params.id as string;
        
        // Fetch template from API
        const response = await fetch(`/api/template/${templateId}`);
        
        if (response.ok) {
          const templateData = await response.json();
          setTemplate(templateData);
          setRenderedContent(templateData.html);
          
          // Set share URL
          const url = window.location.href;
          setShareUrl(url);
        } else {
          toast.error('Template not found or expired');
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        toast.error('Failed to load template');
        setTimeout(() => router.push('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id, router]);

  useEffect(() => {
    if (template) {
      fetchRenderedContent();
    }
  }, [template, variables]);

  const fetchRenderedContent = async () => {
    if (!template) return;
    
    try {
      const response = await fetch('/api/template/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, variables }),
      });

      if (response.ok) {
        const data = await response.json();
        setRenderedContent(data.html);
      }
    } catch (error) {
      console.error('Failed to render template:', error);
    }
  };

  const handleVariablesChange = (newVariables: Record<string, string>) => {
    setVariables(newVariables);
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const hasRequiredVariables = template ? 
    template.variables
      .filter(v => v.required)
      .every(v => variables[v.name] && variables[v.name].trim() !== '') 
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Template Not Found</h2>
          <Link href="/" className="btn-primary">
            Create New Template
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-center" />
      
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold text-gray-900 hidden sm:inline">Easy Mailer</span>
            </Link>
            
            <button
              onClick={handleShareLink}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Template info */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {template.originalFileName}
          </h1>
          <p className="text-sm text-gray-600">
            Fill in the fields below to customize your email
          </p>
        </div>

        {/* Mobile-first responsive layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Variables and Actions */}
          <div className="space-y-6">
            {template.variables.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Fill Variables</h2>
                <VariableForm
                  variables={template.variables}
                  onVariablesChange={handleVariablesChange}
                />
              </div>
            )}
            
            {/* Actions - Mobile optimized */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <ActionButtons
                templateId={template.id}
                variables={variables}
                renderedHtml={renderedContent}
                hasRequiredVariables={hasRequiredVariables}
                template={template}
              />
            </div>

            {/* Mobile share button */}
            <div className="lg:hidden">
              <button
                onClick={handleShareLink}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy Share Link
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:h-[600px] overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Email Preview</h2>
            <div className="h-[400px] lg:h-[520px] overflow-auto">
              <EmailPreview
                templateId={template.id}
                variables={variables}
                template={template}
              />
            </div>
          </div>
        </div>

        {/* Desktop share section */}
        <div className="hidden lg:block mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Share this template</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={handleShareLink}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}