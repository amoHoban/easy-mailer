'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleDrivePickerProps {
  onFileSelected: (file: { content: string; name: string; mimeType: string }) => void;
}

export default function GoogleDrivePicker({ onFileSelected }: GoogleDrivePickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Google API configuration
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    // Load Google API scripts
    const loadGoogleScripts = async () => {
      // Load Google API client
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => initializeGoogleAPI();
      document.body.appendChild(gapiScript);

      // Load Google Identity Services
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.defer = true;
      document.body.appendChild(gisScript);
    };

    if (CLIENT_ID && API_KEY) {
      loadGoogleScripts();
    }
  }, []);

  const initializeGoogleAPI = () => {
    window.gapi.load('client:picker', async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing Google API:', error);
      }
    });
  };

  const handleAuth = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          setIsSignedIn(true);
          showPicker(response.access_token);
        }
      },
    });
    tokenClient.requestAccessToken();
  };

  const showPicker = (accessToken: string) => {
    const picker = new window.google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .addView(window.google.picker.ViewId.DOCS)
      .addView(
        new window.google.picker.DocsView()
          .setIncludeFolders(true)
          .setMimeTypes(
            'application/vnd.google-apps.document,' + // Google Docs
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' + // .docx
            'application/msword,' + // .doc
            'application/rtf,' + // .rtf
            'text/plain' // .txt
          )
      )
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          await handleFileSelection(file, accessToken);
        }
      })
      .build();
    picker.setVisible(true);
  };

  const handleFileSelection = async (file: any, accessToken: string) => {
    try {
      toast.loading('Downloading file from Google Drive...');
      
      let downloadUrl = '';
      let mimeType = file.mimeType;
      
      // Handle Google Docs conversion
      if (file.mimeType === 'application/vnd.google-apps.document') {
        // Export Google Docs as .docx
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        // Regular file download
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      }

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      
      // Convert blob to base64 for processing
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1];
        
        onFileSelected({
          content: base64Content,
          name: file.name,
          mimeType: mimeType,
        });
        
        toast.dismiss();
        toast.success('File loaded from Google Drive!');
      };
      reader.readAsDataURL(blob);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error('Failed to load file from Google Drive');
    }
  };

  if (!CLIENT_ID || !API_KEY) {
    return null; // Don't show if not configured
  }

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      
      <button
        onClick={handleAuth}
        disabled={!isLoaded}
        className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="font-medium text-gray-700">
          {isLoaded ? 'Select from Google Drive' : 'Loading Google Drive...'}
        </span>
      </button>
    </div>
  );
}