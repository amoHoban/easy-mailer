'use client';

import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const handleTemplateProcessed = (processedTemplate: any) => {
    // Redirect to the render page with the encoded template
    if (processedTemplate.encodedId) {
      router.push(`/render/${processedTemplate.encodedId}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Easy Mailer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Convert Word documents into email templates with dynamic variables. 
            Share with anyone, no account needed.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Your Document
            </h2>
            <p className="text-gray-600">
              Support for .docx, .doc, .rtf, and .txt files
            </p>
          </div>

          <FileUpload onTemplateProcessed={handleTemplateProcessed} />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Auto-Detect Variables</h3>
              <p className="text-sm text-gray-600">
                Use [name] for optional and [*email] for required fields
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Shareable Links</h3>
              <p className="text-sm text-gray-600">
                Get a link anyone can use to customize and send
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Send or Copy</h3>
              <p className="text-sm text-gray-600">
                Copy formatted HTML or send with email verification
              </p>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Example template syntax:</p>
          <code className="inline-block bg-gray-100 px-4 py-2 rounded-lg text-sm">
            Dear [*recipient_name], We're writing about [topic]...
          </code>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Files are processed securely and deleted immediately</p>
          <p className="mt-2">No data is stored permanently</p>
        </footer>
      </div>
    </main>
  );
}