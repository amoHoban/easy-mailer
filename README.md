# Easy Mailer 📧

A modern, minimalistic web application that converts Word/RTF documents into email templates with dynamic variable substitution.

![Easy Mailer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- 📄 **Document Upload**: Support for `.docx`, `.doc`, `.rtf`, and `.txt` files
- 🔄 **Variable Detection**: Automatically detects `[variables]` and `[*required]` fields
- 📝 **Dynamic Forms**: Auto-generated input fields for each variable
- 👁️ **Live Preview**: Real-time HTML and plain text preview
- 📋 **Copy to Clipboard**: One-click formatted HTML copy
- ✉️ **Direct Send**: Email verification system for secure sending
- 🎨 **Modern UI**: Clean, minimalistic design with smooth animations
- 🔒 **Secure**: Files deleted immediately after processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Resend API key (for email sending)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/easy-mailer.git
cd easy-mailer
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your email provider in `.env.local`:
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
JWT_SECRET=your-secret-key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import project to Vercel:
```bash
npx vercel
```

3. Set environment variables in Vercel Dashboard:
   - `EMAIL_PROVIDER`: resend
   - `RESEND_API_KEY`: Your Resend API key
   - `JWT_SECRET`: A secure random string
   - `DEFAULT_FROM_EMAIL`: Your verified email

4. Deploy!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_PROVIDER` | Email service (resend/sendgrid/smtp) | Yes |
| `RESEND_API_KEY` | Resend API key | If using Resend |
| `SENDGRID_API_KEY` | SendGrid API key | If using SendGrid |
| `SMTP_*` | SMTP configuration | If using SMTP |
| `JWT_SECRET` | Secret for email verification | Yes |
| `DEFAULT_FROM_EMAIL` | Default sender email | Yes |

## 🔧 Configuration

### Email Providers

#### Resend (Recommended for Vercel)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_key
```

#### SendGrid
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_key
```

#### SMTP (Gmail, Outlook, etc.)
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app_password
```

## 📖 Usage

1. **Upload Document**: Drag and drop or select a Word/RTF file
2. **Fill Variables**: Enter values for detected `[variables]`
3. **Preview**: Review the rendered email
4. **Send or Copy**: 
   - Copy formatted HTML to clipboard
   - Or send via email with verification

### Variable Syntax

- `[name]` - Optional variable
- `[*email]` - Required variable (with asterisk)

Example document:
```
Dear [*recipient_name],

We're writing to inform you about [topic].

Best regards,
[sender_name]
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Document Processing**: Mammoth.js
- **Email**: Resend/SendGrid/Nodemailer
- **Deployment**: Vercel

## 🔒 Security

- Files are processed in memory and deleted immediately
- HTML content is sanitized to prevent XSS
- Email verification prevents spoofing
- JWT tokens expire after 1 hour
- No data persistence - everything is temporary

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Large files (>10MB) are not supported
- Complex Word formatting may not be preserved perfectly
- Email verification links expire after 1 hour

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript