'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface ActionButtonsProps {
  templateId: string;
  variables: Record<string, string>;
  renderedHtml: string;
  hasRequiredVariables: boolean;
  template?: any;
}

export default function ActionButtons({ 
  templateId, 
  variables, 
  renderedHtml,
  hasRequiredVariables,
  template 
}: ActionButtonsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderedHtml;
      
      // Create a blob with the HTML content
      const blob = new Blob([renderedHtml], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      
      await navigator.clipboard.write([clipboardItem]);
      toast.success('Email template copied to clipboard!');
    } catch (error) {
      // Fallback to plain text copy
      try {
        await navigator.clipboard.writeText(renderedHtml);
        toast.success('Email template copied as HTML text!');
      } catch (err) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const handleSendEmail = async () => {
    if (!email || !subject) {
      toast.error('Please enter email and subject');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          template,
          variables,
          to: email,
          subject,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Check your inbox.');
        setShowEmailForm(false);
        setEmail('');
        setSubject('');
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!hasRequiredVariables) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Please fill in all required fields before proceeding
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy to Clipboard</span>
        </button>
        
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 active:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Send Email</span>
        </button>
      </div>

      {showEmailForm && (
        <div className="animate-slide-up bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="font-medium text-gray-900">Send Email with Verification</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              placeholder="Enter email subject"
              disabled={sending}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ We'll send you a verification email to confirm your address before sending the actual email.
            </p>
          </div>

          <button
            onClick={handleSendEmail}
            disabled={sending || !email || !subject}
            className="btn-primary w-full"
          >
            {sending ? 'Sending...' : 'Send Verification Email'}
          </button>
        </div>
      )}
    </div>
  );
}