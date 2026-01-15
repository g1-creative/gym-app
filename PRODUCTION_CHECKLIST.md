# Production Deployment Checklist

Use this checklist before deploying Gymville to production.

## Phase 1: Critical (Must Complete)

### Environment & Configuration

- [ ] All environment variables are set and validated
- [ ] `.env.local` is in `.gitignore` (should already be)
- [ ] Separate Supabase project for production (don't use dev database)
- [ ] Service worker version updated if changes were made
- [ ] Production domain configured in environment variables

### Security

- [ ] Security headers configured in `next.config.js`
- [ ] RLS policies verified on all Supabase tables
- [ ] Service role key kept secure (not exposed in client code)
- [ ] CORS configuration reviewed
- [ ] Authentication redirect URLs configured for production domain

### Code Quality

- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] All linting errors resolved (`npm run lint`)
- [ ] Production build succeeds locally (`npm run build`)
- [ ] No console.log statements in production code paths
- [ ] Error boundaries implemented
- [ ] Error tracking configured (Sentry or alternative)

### PWA Requirements

- [ ] All icon files exist and are properly sized:
  - [ ] `icon-192.png` (192x192)
  - [ ] `icon-512.png` (512x512)
  - [ ] `gymville-logo.png` (for Apple)
- [ ] `manifest.json` is valid and accessible
- [ ] Service worker registers correctly
- [ ] Offline page works
- [ ] PWA installs on mobile devices (iOS & Android)
- [ ] App icons display correctly when installed

## Phase 2: Important (Should Complete)

### Performance

- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Images optimized and using Next.js Image component
- [ ] Large components are code-split or lazy-loaded
- [ ] Bundle size analyzed (`npm run build` output reviewed)
- [ ] Core Web Vitals acceptable:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### SEO

- [ ] `robots.txt` exists and is correct
- [ ] Sitemap generated and accessible at `/sitemap.xml`
- [ ] Meta descriptions are descriptive and unique
- [ ] Open Graph tags configured
- [ ] Twitter Card metadata configured
- [ ] Canonical URLs set correctly
- [ ] Production domain updated in:
  - [ ] `robots.txt`
  - [ ] `app/layout.tsx` (Open Graph)
  - [ ] `app/sitemap.ts`

### Analytics & Monitoring

- [ ] Analytics integrated (Google Analytics, Plausible, etc.)
- [ ] Error tracking service configured (Sentry recommended)
- [ ] Performance monitoring set up
- [ ] User identification implemented (if needed)
- [ ] Key events tracked:
  - [ ] Workout started/completed
  - [ ] Program created
  - [ ] Exercise logged
  - [ ] User signup/login

### Database

- [ ] Production database migrations applied
- [ ] RLS policies tested with real user data
- [ ] Database backups enabled
- [ ] Connection pooling configured
- [ ] Indexes added for common queries

### Authentication

- [ ] Email confirmation enabled in Supabase
- [ ] Email templates customized
- [ ] Password reset flow tested
- [ ] Social auth providers configured (if using)
- [ ] Session expiration configured
- [ ] Redirect URLs whitelisted for production domain

## Phase 3: Testing

### Functionality Testing

- [ ] User signup works
- [ ] User login works
- [ ] Password reset works
- [ ] Email confirmation works
- [ ] Create program works
- [ ] Create workout works
- [ ] Log exercise set works
- [ ] Rest timer functions correctly
- [ ] Analytics display correctly
- [ ] History loads correctly
- [ ] Program deletion works (with RLS)

### Device Testing

- [ ] Desktop browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Mobile browsers:
  - [ ] iOS Safari
  - [ ] Chrome on Android
- [ ] PWA installation:
  - [ ] iOS (Add to Home Screen)
  - [ ] Android (Install App prompt)
  - [ ] Desktop (Chrome/Edge install)

### Offline Testing

- [ ] Service worker installs correctly
- [ ] Offline page displays when network is offline
- [ ] Cached pages load when offline
- [ ] Data syncs when back online

### Performance Testing

- [ ] Fast 3G connection tested
- [ ] Slow 3G connection tested
- [ ] Page load times acceptable
- [ ] Time to interactive < 3s
- [ ] No memory leaks detected

## Phase 4: Documentation

- [ ] README.md updated with production information
- [ ] DEPLOYMENT.md guide reviewed
- [ ] Environment variables documented in ENV_SETUP.md
- [ ] API documentation updated (if applicable)
- [ ] User guide created (if needed)

## Phase 5: Infrastructure

### Hosting (Vercel)

- [ ] Project connected to Git repository
- [ ] Auto-deploy on push to main configured
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Domain redirects configured (www → non-www or vice versa)

### Supabase

- [ ] Production project created
- [ ] Database migrations applied
- [ ] RLS enabled on all tables
- [ ] API keys rotated (different from dev)
- [ ] Email delivery configured
- [ ] Rate limiting configured
- [ ] Backups enabled

### CDN & Caching

- [ ] Static assets cached properly
- [ ] Service worker caching strategy verified
- [ ] CDN configured (automatic with Vercel)

## Phase 6: Monitoring & Maintenance

### Monitoring Setup

- [ ] Error rate alerts configured
- [ ] Performance alerts configured
- [ ] Uptime monitoring enabled
- [ ] Database performance monitoring
- [ ] API endpoint monitoring

### Backup Strategy

- [ ] Database backup schedule confirmed
- [ ] Backup restoration tested
- [ ] User data export script created
- [ ] Disaster recovery plan documented

## Phase 7: Legal & Compliance

- [ ] Privacy policy created and linked
- [ ] Terms of service created and linked
- [ ] Cookie consent implemented (if required)
- [ ] GDPR compliance verified (if EU users)
- [ ] Data retention policy defined
- [ ] User data deletion process implemented

## Phase 8: Launch Preparation

### Pre-Launch

- [ ] Soft launch with beta users completed
- [ ] Major bugs fixed
- [ ] User feedback incorporated
- [ ] Support email/system set up
- [ ] Social media accounts created
- [ ] Landing page ready
- [ ] App store presence prepared (if applicable)

### Launch Day

- [ ] Final production build deployed
- [ ] Smoke tests passed
- [ ] Monitoring dashboards active
- [ ] Support team ready
- [ ] Announcement prepared
- [ ] Marketing materials ready

## Post-Launch (First 48 Hours)

- [ ] Monitor error rates
- [ ] Monitor server performance
- [ ] Monitor user sign-ups
- [ ] Check analytics data flowing
- [ ] Monitor social media for issues
- [ ] Respond to user feedback
- [ ] Hot-fix critical bugs immediately

## Weekly Maintenance

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor security alerts
- [ ] Review analytics insights
- [ ] Plan feature iterations
- [ ] Database maintenance

## Monthly Maintenance

- [ ] Security audit
- [ ] Performance audit
- [ ] Dependency updates
- [ ] Backup verification
- [ ] Cost analysis
- [ ] User feedback review

---

## Sign-Off

Before deploying to production, ensure:

- [ ] Product owner approval
- [ ] Technical lead approval
- [ ] QA approval
- [ ] All critical items completed
- [ ] Rollback plan ready
- [ ] Support team briefed

**Deployment Date:** _______________

**Deployed By:** _______________

**Version:** _______________

---

## Emergency Contacts

- **Technical Lead:** _______________
- **Database Admin:** _______________
- **DevOps:** _______________
- **Support:** _______________

## Rollback Procedure

If critical issues arise:

1. Stop deployment immediately
2. Notify team
3. Execute rollback (see DEPLOYMENT.md)
4. Document issue
5. Plan fix
6. Re-deploy when ready

---

**Remember:** It's better to delay deployment than to rush and deploy with critical issues!
