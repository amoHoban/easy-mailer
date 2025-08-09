'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import VariableForm from '@/components/VariableForm';
import EmailPreview from '@/components/EmailPreview';
import ActionButtons from '@/components/ActionButtons';
import { TemplateVariable } from '@/types';

export default function Home() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([]);
  const [userVariables, setUserVariables] = useState<Record<string, string>>({});
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'upload' | 'fill' | 'preview'>('upload');

  const handleTemplateProcessed = (template: any) => {
    setTemplateId(template.id);
    setTemplateVariables(template.variables || []);
    setCurrentStep(template.variables?.length > 0 ? 'fill' : 'preview');
  };

  const handleVariablesChange = (variables: Record<string, string>) => {
    setUserVariables(variables);
  };

  const hasAllRequiredVariables = () => {
    return templateVariables
      .filter(v => v.required)
      .every(v => userVariables[v.name]);
  };

  useEffect(() => {
    if (templateId && currentStep === 'preview') {
      fetchRenderedTemplate();
    }
  }, [templateId, userVariables, currentStep]);

  const fetchRenderedTemplate = async () => {
    if (!templateId) return;
    
    try {
      const response = await fetch(`/api/template/${templateId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: userVariables }),
      });

      if (response.ok) {
        const data = await response.json();
        setRenderedHtml(data.html);
      }
    } catch (error) {
      console.error('Failed to fetch rendered template:', error);
    }
  };

  const resetApp = () => {
    setTemplateId(null);
    setTemplateVariables([]);
    setUserVariables({});
    setRenderedHtml('');
    setCurrentStep('upload');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Easy Mailer
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Convert your Word documents into email templates with dynamic variables.
          Fill in the fields and send or copy your personalized email.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'upload' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          
          <div className="w-20 h-0.5 bg-gray-300"></div>
          
          <div className={`flex items-center ${currentStep === 'fill' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'fill' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Fill Variables</span>
          </div>
          
          <div className="w-20 h-0.5 bg-gray-300"></div>
          
          <div className={`flex items-center ${currentStep === 'preview' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'preview' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Send or Copy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-xl p-8 animate-slide-up">
        {currentStep === 'upload' && (
          <div>
            <FileUpload onTemplateProcessed={handleTemplateProcessed} />
          </div>
        )}

        {currentStep === 'fill' && templateId && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Customize Your Email</h2>
              <button
                onClick={resetApp}
                className="text-gray-500 hover:text-gray-700"
              >
                Start Over
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <VariableForm
                  variables={templateVariables}
                  onVariablesChange={handleVariablesChange}
                />
                
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={resetApp}
                    className="btn-secondary flex-1"
                  >
                    Upload New Document
                  </button>
                  <button
                    onClick={() => setCurrentStep('preview')}
                    disabled={!hasAllRequiredVariables()}
                    className="btn-primary flex-1"
                  >
                    Preview Email
                  </button>
                </div>
              </div>

              <div className="h-[500px]">
                <EmailPreview
                  templateId={templateId}
                  variables={userVariables}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && templateId && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Email is Ready!</h2>
              <div className="flex gap-3">
                {templateVariables.length > 0 && (
                  <button
                    onClick={() => setCurrentStep('fill')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Edit Variables
                  </button>
                )}
                <button
                  onClick={resetApp}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Start Over
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[500px]">
                <EmailPreview
                  templateId={templateId}
                  variables={userVariables}
                />
              </div>

              <div>
                <ActionButtons
                  templateId={templateId}
                  variables={userVariables}
                  renderedHtml={renderedHtml}
                  hasRequiredVariables={hasAllRequiredVariables()}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Easy Mailer - Convert documents to email templates instantly</p>
        <p className="mt-2">Files are processed locally and deleted immediately after use</p>
      </footer>
    </main>
  );
}