# Gymville PWA - Deployment Guide

This guide walks you through deploying Gymville to production.

## Pre-Deployment Checklist

Before deploying, ensure you've completed all items in `PRODUCTION_CHECKLIST.md`.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications with excellent PWA support.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel project settings, add these environment variables:
   
   **Required:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   
   **Optional:**
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
   - `NEXT_PUBLIC_SITE_URL` - Your production domain (e.g., https://gymville.com)
   - `NEXT_PUBLIC_GA_ID` - Google Analytics ID (if using)
   - `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (if using)

4. **Update Configuration Files**
   
   Update these files with your production domain:
   - `public/robots.txt` - Update sitemap URL
   - `app/layout.tsx` - Update OpenGraph URL
   - Update any hardcoded URLs

5. **Deploy**
   - Click "Deploy" in Vercel
   - Vercel will build and deploy automatically
   - Each push to `main` will trigger a new deployment

6. **Configure Custom Domain** (Optional)
   - In Vercel project settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions
   - Enable HTTPS (automatic with Vercel)

### Option 2: Netlify

1. **Build Configuration**
   
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy

### Option 3: Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   # Build application
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Update next.config.js**
   ```javascript
   module.exports = {
     output: 'standalone',
     // ... rest of config
   }
   ```

3. **Build and run**
   ```bash
   docker build -t gymville .
   docker run -p 3000:3000 gymville
   ```

## Post-Deployment Configuration

### 1. Supabase Production Setup

1. **Enable Email Confirmations**
   - Supabase Dashboard → Authentication → Settings
   - Enable "Confirm email"
   - Configure email templates

2. **Configure Redirect URLs**
   - Add your production domain to allowed redirect URLs
   - Format: `https://your-domain.com/auth/callback`

3. **Review RLS Policies**
   - Verify all Row Level Security policies are in place
   - Test with production data

### 2. PWA Verification

1. **Test Installation**
   - Visit your site on mobile (iOS/Android)
   - Verify install prompt appears
   - Test offline functionality

2. **Lighthouse Audit**
   ```bash
   # Run Lighthouse in Chrome DevTools
   # Score should be 90+ for PWA
   ```

3. **Service Worker**
   - Verify service worker registers correctly
   - Test cache functionality
   - Test update notifications

### 3. Analytics Setup

If using analytics, configure:

1. **Google Analytics**
   - Add GA ID to environment variables
   - Update `lib/analytics.ts` with GA implementation
   - Verify tracking works

2. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/nextjs
   ```
   - Configure Sentry DSN
   - Update `lib/error-tracking.ts`
   - Test error reporting

### 4. Performance Optimization

1. **Enable Caching**
   - Vercel automatically handles caching
   - For self-hosted, configure CDN

2. **Image Optimization**
   - Verify all images use Next.js Image component
   - Check image sizes and formats

3. **Monitor Performance**
   - Set up Vercel Analytics or alternative
   - Monitor Core Web Vitals

## Domain Configuration

### DNS Settings

For custom domain:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

### HTTPS

- Vercel provides automatic HTTPS
- Certificate auto-renews
- Force HTTPS redirect enabled by default

## Monitoring & Maintenance

### 1. Error Monitoring

- Set up error tracking (Sentry recommended)
- Monitor error rates
- Set up alerts for critical errors

### 2. Performance Monitoring

- Monitor Core Web Vitals
- Track page load times
- Monitor API response times

### 3. Analytics

- Track user engagement
- Monitor conversion funnels
- Track workout completion rates

### 4. Uptime Monitoring

Consider services like:
- UptimeRobot
- Pingdom
- Better Uptime

## Backup Strategy

### Database Backups

Supabase automatically backs up your database:
- Point-in-time recovery available
- Daily backups retained for 7 days (Free plan)
- Manual backups recommended before major changes

### Export User Data

Create backup scripts for:
- User data
- Workout sessions
- Programs and templates

## Rollback Procedure

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual Rollback

```bash
git revert HEAD
git push origin main
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env.local`
- Rotate keys periodically
- Use separate keys for staging/production

### 2. API Keys

- Keep service role key secure
- Use anon key for client-side
- Enable RLS on all tables

### 3. Rate Limiting

Consider adding rate limiting:
- Vercel Edge Functions
- Supabase built-in rate limiting
- Custom middleware

## Troubleshooting

### Build Fails

1. Check environment variables are set
2. Run `npm run build` locally
3. Check build logs in Vercel

### Service Worker Issues

1. Clear cache and hard reload
2. Check service worker registration
3. Verify manifest.json is accessible

### Database Connection Issues

1. Verify Supabase credentials
2. Check connection pooling limits
3. Review RLS policies

## Support

For issues:
1. Check documentation
2. Review error logs
3. Check Supabase status
4. Review Vercel deployment logs

## Next Steps

After deployment:
1. Monitor error rates
2. Track performance metrics
3. Gather user feedback
4. Plan feature iterations
5. Regular security audits
