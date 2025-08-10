# 🐘 Neon PostgreSQL Setup for Easy Mailer

## Quick Setup (5 minutes)

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub/Google/Email
3. **Free tier includes**:
   - 0.5 GB storage
   - Always-on database
   - Perfect for this app!

### 2. Create Database
1. Click **"Create a database"**
2. Choose a name (e.g., `easy-mailer`)
3. Select region closest to your users
4. Click **"Create"**

### 3. Get Connection String
1. In your Neon dashboard
2. Copy the **connection string** (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 4. Add to Vercel
```bash
vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

Or in Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add `DATABASE_URL` with your connection string

### 5. Initialize Database
After deployment, visit:
```
https://your-app.vercel.app/api/init-db
```

This creates the required tables automatically!

## 📊 Database Schema

```sql
CREATE TABLE templates (
  id VARCHAR(20) PRIMARY KEY,        -- Short 8-char ID
  html TEXT NOT NULL,                -- HTML content
  plain_text TEXT NOT NULL,          -- Plain text version
  variables JSONB NOT NULL,          -- Template variables
  original_file_name VARCHAR(255),   -- Original filename
  created_at TIMESTAMP,              -- Creation time
  expires_at TIMESTAMP               -- Auto-expire after 7 days
);
```

## 🔧 Features

- **Short URLs**: 8-character IDs (e.g., `/render/x7K9mP2q`)
- **Auto-expiry**: Templates deleted after 7 days
- **Fast queries**: Indexed for performance
- **Reliable**: PostgreSQL ACID compliance
- **Scalable**: Handles thousands of templates

## 🚀 Deployment Steps

1. **Add Neon connection string** to Vercel:
   ```bash
   vercel env add DATABASE_URL production
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Initialize database** (one time):
   ```
   curl https://your-app.vercel.app/api/init-db
   ```

## ✅ Verify Setup

Check if working:
1. Upload a document
2. You'll get a short URL like `/render/abc12345`
3. Share the link - it works for 7 days!

## 🔍 Monitor Usage

In Neon Dashboard, you can see:
- Active connections
- Storage used
- Query performance
- Database metrics

## 🆘 Troubleshooting

### "Failed to store template"
- Check DATABASE_URL is set correctly
- Ensure database is active in Neon dashboard
- Check Vercel function logs

### "Template not found"
- Template may have expired (7 days)
- Check if ID exists in database
- Verify database connection

### Connection errors
- Make sure `?sslmode=require` is in connection string
- Check if database is paused (Neon free tier auto-pauses after inactivity)
- Wake it up by visiting Neon dashboard

## 📈 Limits

### Free Tier (Neon)
- 0.5 GB storage (~5000 templates)
- Auto-pause after 5 minutes inactivity
- Instant wake-up on request

### Template Limits
- Max size: ~100KB per template
- Expires: 7 days
- URL length: 8 characters

## 🎉 That's It!

Your Easy Mailer now has reliable PostgreSQL storage with:
- Short, shareable URLs
- Automatic cleanup
- Professional database backend
- Zero maintenance required!