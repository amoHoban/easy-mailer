# Google Drive Integration Setup

## Overview
Easy Mailer supports importing documents directly from Google Drive. This feature allows users to select Word documents, Google Docs, and text files from their Google Drive without downloading them first.

## Prerequisites
You need a Google Cloud Project with the necessary APIs enabled and OAuth 2.0 credentials configured.

## Setup Instructions

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Note your Project ID

### 2. Enable Required APIs
In your Google Cloud Project, enable the following APIs:
1. Go to "APIs & Services" > "Library"
2. Search and enable:
   - **Google Drive API** - For accessing Drive files
   - **Google Picker API** - For the file picker interface

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for public access
   - Fill in required fields (app name, support email, etc.)
   - Add your domain to authorized domains
   - Add scopes: `https://www.googleapis.com/auth/drive.readonly`
4. For the OAuth client:
   - Application type: "Web application"
   - Name: "Easy Mailer"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.vercel.app` (for production)
   - No redirect URIs needed (we use implicit grant flow)
5. Save and note your **Client ID**

### 4. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Restrict the API key:
   - Application restrictions: "HTTP referrers"
   - Add websites:
     - `http://localhost:3000/*` (for development)
     - `https://your-domain.vercel.app/*` (for production)
   - API restrictions: Select "Restrict key" and choose:
     - Google Drive API
     - Google Picker API
4. Save and note your **API Key**

### 5. Configure Environment Variables
Add these to your `.env.local` file (development) or Vercel environment variables (production):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
```

**Important**: These are public environment variables (prefixed with `NEXT_PUBLIC_`) as they're used in the browser. Ensure your API key and OAuth client are properly restricted to your domains.

### 6. Test the Integration
1. Start your development server: `npm run dev`
2. Upload a document to create a template
3. You should see a "Select from Google Drive" button below the upload area
4. Click it to authenticate with Google and select a file

## Supported File Types
- Google Docs (automatically converted to .docx)
- Microsoft Word documents (.doc, .docx)
- Rich Text Format (.rtf)
- Plain text files (.txt)

## Troubleshooting

### "Google Drive integration not configured"
The Google Drive button only appears when both environment variables are set. Check that:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- `NEXT_PUBLIC_GOOGLE_API_KEY` is set correctly
- You've restarted the development server after adding environment variables

### "Failed to load Google Drive"
- Verify your API key restrictions match your domain
- Check that both Google Drive API and Google Picker API are enabled
- Ensure OAuth consent screen is configured

### "Access blocked: App has not been verified"
- This appears for unverified apps in production
- For development, add test users in OAuth consent screen
- For production, submit your app for Google verification

## Security Notes
- The API key and Client ID are public but should be restricted to your domains
- Users must explicitly grant permission to access their Drive files
- Only read-only access is requested (`drive.readonly` scope)
- Files are processed client-side and sent to your server as base64 data
- No Drive tokens or credentials are stored

## Production Deployment
When deploying to Vercel:
1. Add environment variables in Vercel dashboard
2. Update OAuth client authorized origins with your production domain
3. Update API key restrictions with your production domain
4. Consider submitting for Google OAuth verification for better user experience