# 🗄️ Storage Setup Guide for Easy Mailer

The app now uses **Neon PostgreSQL** with **short URLs** (8 characters) for reliable, scalable storage.

## 🐘 Database Setup (Neon PostgreSQL)

### Option 1: Vercel KV (Recommended for Vercel)

1. **Enable Vercel KV** in your Vercel Dashboard:
   - Go to your project → Storage tab
   - Click "Create Database"
   - Choose "KV"
   - Follow the setup wizard
   - Vercel automatically sets the environment variables

2. **That's it!** The app will automatically detect and use Vercel KV.

### Option 2: Upstash Redis (Free Alternative)

1. **Sign up** at [upstash.com](https://upstash.com)
   - Free tier includes 10,000 commands/day
   - Perfect for small to medium usage

2. **Create a Redis Database**:
   - Click "Create Database"
   - Choose your region (closest to your users)
   - Select "Regional" for free tier

3. **Get your credentials**:
   - Go to your database
   - Copy the REST API credentials:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Add to Vercel**:
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   ```

### Option 3: In-Memory (Development Only)

If no storage is configured, the app falls back to in-memory storage.
- ⚠️ **Warning**: Data is lost on server restart
- Only use for local development

## 🔧 How It Works

1. **Upload**: Document → Processed → Stored with 8-character ID
2. **Share**: `/render/abc12345` (short and shareable!)
3. **Storage**: Templates expire after 7 days
4. **Fallback**: If storage fails, uses limited base64 encoding

## 📊 Storage Comparison

| Feature | Vercel KV | Upstash Redis | In-Memory |
|---------|-----------|---------------|-----------|
| Free Tier | Yes (with limits) | 10k commands/day | Yes |
| Persistence | Yes | Yes | No |
| Setup | Automatic | Manual | None |
| Best For | Vercel deployments | Any platform | Development |

## 🚀 Quick Setup Commands

### For Vercel KV:
```bash
# In Vercel Dashboard → Storage → Create KV Database
# Done! Auto-configured
```

### For Upstash:
```bash
# After creating database at upstash.com
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel --prod
```

## 🔍 Verify Setup

After deployment, check the logs:
- "Using Vercel KV storage" ✅
- "Using Upstash Redis storage" ✅
- "Using in-memory storage" ⚠️ (not for production)

## 📝 Template Limits

- **Max template size**: ~100KB
- **Storage duration**: 7 days
- **URL length**: 8 characters (e.g., `/render/x7K9mP2q`)

## 🆘 Troubleshooting

### "Template not found"
- Template may have expired (7 days)
- Storage not configured properly
- Check environment variables

### "Failed to store template"
- Storage service may be down
- Exceeded rate limits
- Check storage dashboard

### URLs still too long?
- Make sure you're using the latest deployment
- Clear browser cache
- Storage might not be configured