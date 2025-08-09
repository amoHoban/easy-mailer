'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import VariableForm from '@/components/VariableForm';
import EmailPreview from '@/components/EmailPreview';
import ActionButtons from '@/components/ActionButtons';
import { ProcessedTemplate } from '@/types';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [template, setTemplate] = useState<ProcessedTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [renderedContent, setRenderedContent] = useState<string>('');

  const handleTemplateProcessed = (processedTemplate: Partial<ProcessedTemplate>) => {
    const fullTemplate = processedTemplate as ProcessedTemplate;
    setTemplate(fullTemplate);
    setVariableValues({});
    setRenderedContent(fullTemplate.html || '');
  };

  const handleVariablesChange = (variables: Record<string, string>) => {
    setVariableValues(variables);
    // Update rendered content whenever variables change
    if (template) {
      fetchRenderedContent(template.id, variables);
    }
  };

  const fetchRenderedContent = async (templateId: string, variables: Record<string, string>) => {
    try {
      const response = await fetch(`/api/template/${templateId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables }),
      });

      if (response.ok) {
        const data = await response.json();
        setRenderedContent(data.html);
      }
    } catch (error) {
      console.error('Failed to render template:', error);
    }
  };

  const hasRequiredVariables = template ? 
    template.variables
      .filter(v => v.required)
      .every(v => variableValues[v.name] && variableValues[v.name].trim() !== '') 
    : false;

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Easy Mailer
          </h1>
          <p className="text-gray-600">
            Convert documents to email templates with dynamic variables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Variables */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
              <FileUpload onTemplateProcessed={handleTemplateProcessed} />
            </div>

            {template && template.variables.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Fill Variables</h2>
                <VariableForm
                  variables={template.variables}
                  onVariablesChange={handleVariablesChange}
                />
              </div>
            )}
          </div>

          {/* Right Column - Preview and Actions */}
          <div className="space-y-6">
            {template && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
                  <EmailPreview 
                    templateId={template.id}
                    variables={variableValues}
                  />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Actions</h2>
                  <ActionButtons
                    renderedHtml={renderedContent}
                    templateId={template.id}
                    variables={variableValues}
                    hasRequiredVariables={hasRequiredVariables}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {!template && (
          <div className="mt-12 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p>Upload a document to get started</p>
          </div>
        )}
      </div>
    </main>
  );
}