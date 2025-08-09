# 🚀 Easy Mailer - Deployment Guide

## Quick Deploy to Vercel

### Step 1: Get a Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free
3. Get your API key (starts with `re_`)

### Step 2: Deploy via GitHub

Since there's a local build issue, deploy via GitHub:

1. **Create GitHub Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `easy-mailer`
   - Make it public
   - Don't initialize with README

2. **Push Your Code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/easy-mailer.git
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel**:
   - Go to [vercel.com/import](https://vercel.com/import)
   - Import your GitHub repository
   - Click "Import"

4. **Add Environment Variables**:
   During import, add these environment variables:
   
   | Key | Value |
   |-----|-------|
   | `EMAIL_PROVIDER` | `resend` |
   | `RESEND_API_KEY` | `re_YOUR_API_KEY` |
   | `JWT_SECRET` | `any-random-secret-string` |
   | `DEFAULT_FROM_EMAIL` | `onboarding@resend.dev` |

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `easymailer.com`)
3. Add DNS records as shown by Vercel:
   - CNAME: `cname.vercel-dns.com`
   - Or A records for apex domain

## Alternative: Direct Vercel CLI Deploy

If you want to try CLI deployment again:

```bash
# Clean install (use different Node version)
nvm use 18
rm -rf node_modules package-lock.json
npm install

# Deploy
vercel --prod
```

## Environment Variables Reference

### Required:
- `EMAIL_PROVIDER`: Email service (`resend`, `sendgrid`, or `smtp`)
- `RESEND_API_KEY`: Your Resend API key (if using Resend)
- `JWT_SECRET`: Secret for email verification tokens
- `DEFAULT_FROM_EMAIL`: Default sender email

### Optional (for other providers):
- `SENDGRID_API_KEY`: SendGrid API key
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP port (usually 587)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password

## Troubleshooting

### Build Fails?
- Make sure you're using Node 18+
- Check all environment variables are set
- Try deploying via GitHub instead of CLI

### Email Not Sending?
- Verify your Resend API key is correct
- Check Vercel Function logs in dashboard
- Ensure `DEFAULT_FROM_EMAIL` is verified in Resend

## Your Deployment URLs

Once deployed, you'll have:
- Production: `https://easy-mailer.vercel.app`
- Preview: `https://easy-mailer-git-main-YOUR_USERNAME.vercel.app`

## Success! 🎉

Your Easy Mailer app is now live and ready to:
- Convert documents to email templates
- Auto-detect variables with `[name]` syntax
- Send emails with verification
- Copy formatted emails to clipboard

Enjoy your new email template app!