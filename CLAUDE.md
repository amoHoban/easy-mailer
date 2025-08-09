# Easy Mailer - Project Specification

## 📋 Project Overview
Easy Mailer is a modern, minimalistic web application that converts Word/RTF documents into email templates with dynamic variable substitution. Users can upload documents, fill in template variables, and either copy the formatted email to their clipboard or send it directly with email verification.

## 🎯 Core Features

### 1. Document Upload & Processing
- **Supported Formats**: `.docx`, `.doc`, `.rtf`, `.txt`
- **File Size Limit**: 10MB
- **Auto-cleanup**: Files are deleted immediately after processing
- **Storage**: Templates stored temporarily in memory (cleared on restart)

### 2. Variable System
- **Syntax**: 
  - `[variable_name]` - Optional field
  - `[*variable_name]` - Required field (must be filled)
- **Auto-detection**: System automatically detects all bracketed variables
- **Dynamic Forms**: Input fields are generated for each detected variable

### 3. Email Options
#### Option A: Copy to Clipboard
- One-click copy of formatted HTML email
- Preserves all formatting, images, and styling
- Ready to paste into any email client

#### Option B: Direct Send with Verification
- User enters their email address
- Verification email sent to confirm ownership
- After verification, email is sent FROM the user's verified address
- Prevents email spoofing and abuse

### 4. Email Provider Configuration
- **Configurable Providers**:
  - Nodemailer (SMTP) - Works with Gmail, Outlook, etc.
  - SendGrid API - Recommended for Vercel
  - Resend API - Best for Vercel deployment
- Environment-based configuration

## 🎨 Design Specifications
- **Style**: Modern minimalistic
- **Color Scheme**: 
  - Primary: Clean whites and light grays
  - Accent: Subtle blue (#0070f3)
  - Error: Soft red (#f44336)
- **Typography**: System fonts for fast loading
- **Layout**: Centered, card-based design with smooth shadows
- **Responsive**: Mobile-first approach

## 🏗️ Technical Architecture

### Frontend (Next.js 14)
```
/app
  /api
    /upload          - Document upload endpoint
    /template        - Template processing
    /email          - Email sending/verification
  /components
    FileUpload.tsx   - Drag & drop upload
    VariableForm.tsx - Dynamic variable inputs
    Preview.tsx      - Email preview
    CopyButton.tsx   - Clipboard functionality
  page.tsx          - Main application
  layout.tsx        - Root layout with metadata
```

### Backend Services
- **Document Processing**: Mammoth.js for Word/RTF conversion
- **Sanitization**: sanitize-html for security
- **Email Services**: Nodemailer/SendGrid/Resend
- **Verification**: JWT tokens with 1-hour expiry

### Deployment (Vercel)
- **Environment Variables**:
  ```
  EMAIL_PROVIDER=resend
  RESEND_API_KEY=re_xxxxx
  JWT_SECRET=random-secret-key
  NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
  ```
- **Recommended Email Provider**: Resend (best Vercel integration)
- **File Handling**: Uses /tmp directory for temporary files

## 🔄 User Flow

1. **Upload Document**
   - User drags or selects Word/RTF file
   - System processes and extracts content
   - Variables are detected and displayed

2. **Fill Variables**
   - Dynamic form shows all detected variables
   - Required fields marked with asterisk
   - Real-time validation

3. **Preview Email**
   - Live preview updates as variables are filled
   - Shows both HTML and plain text versions

4. **Send or Copy**
   - **Copy**: One-click copy formatted HTML
   - **Send**: Enter email → Receive verification → Confirm → Sent

## 🔒 Security Considerations
- File upload validation (type, size)
- HTML sanitization to prevent XSS
- Email verification to prevent spoofing
- Rate limiting on API endpoints
- Temporary file storage with auto-cleanup
- No persistent data storage

## 📦 Dependencies
### Core
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Processing
- Mammoth.js (Word conversion)
- sanitize-html (Security)

### Email
- Nodemailer (SMTP)
- @sendgrid/mail (SendGrid)
- Resend (Recommended for Vercel)

### Utilities
- JWT (Verification tokens)
- UUID (Unique IDs)
- Multer (File uploads)

## 🚀 Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # TypeScript validation
```

## 📝 Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure email provider (Resend recommended for Vercel)
3. Set JWT_SECRET for verification tokens
4. Set NEXT_PUBLIC_APP_URL to your domain

## 🌐 Deployment Checklist
- [ ] Set up Resend account and API key
- [ ] Configure environment variables in Vercel
- [ ] Set up custom domain (optional)
- [ ] Test email sending in production
- [ ] Monitor usage and rate limits

## 💡 Future Enhancements (Not in MVP)
- Template library/history
- Multiple file formats (PDF, HTML)
- Email scheduling
- Analytics dashboard
- Team collaboration features
- Custom branding options