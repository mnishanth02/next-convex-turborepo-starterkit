# Production Deployment Guide

This guide covers everything you need to know to deploy your Next.js + Convex task application to production.

## Pre-Deployment Checklist

### ✅ Essential Configuration

- [ ] **Environment Variables Set**
  - `NEXT_PUBLIC_CONVEX_URL` - Your production Convex deployment URL
  - `NEXT_PUBLIC_SITE_URL` - Your production domain (e.g., https://yourdomain.com)

- [ ] **SEO Configuration**
  - Update `siteConfig` in `apps/web/app/layout.tsx` with your company/app details
  - Replace `@yourtwitterhandle` with your actual Twitter/X handle
  - Create an OpenGraph image at `/public/og-image.png` (1200x630px)
  - Add favicon files (`favicon.ico`, `favicon-16x16.png`, `apple-touch-icon.png`)
  - Create `site.webmanifest` for PWA support (optional)

- [ ] **Security Review**
  - Review Content Security Policy in `next.config.mjs`
  - Add your analytics/monitoring domains to CSP if needed
  - Ensure HTTPS is enabled on your hosting platform

- [ ] **Convex Backend**
  - Run `npx convex deploy` to deploy backend to production
  - Save the production deployment URL
  - Configure any Convex environment variables (auth, API keys, etc.)

### 🔍 Code Quality Checks

```bash
# Run from repository root
pnpm check          # Biome linting and formatting
pnpm build          # Test production build
pnpm typecheck      # TypeScript type checking (in apps/web)
```

## Deployment Platforms

### Vercel (Recommended)

Vercel provides the best Next.js deployment experience with automatic Convex integration.

#### Deploy Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   pnpm add -g vercel

   # Or use Vercel Dashboard
   # https://vercel.com/new
   ```

2. **Configure Environment Variables**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   NEXT_PUBLIC_CONVEX_URL=https://your-production.convex.cloud
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Deploy Convex Backend**
   ```bash
   cd packages/backend
   npx convex deploy
   # Copy the production URL to Vercel environment variables
   ```

4. **Deploy Frontend**
   ```bash
   # Automatic via Git push, or manual:
   vercel --prod
   ```

#### Vercel-Specific Configuration

- **Build Command**: `turbo build` (default from root)
- **Output Directory**: `apps/web/.next`
- **Install Command**: `pnpm install`
- **Framework Preset**: Next.js

### Netlify

1. **Build Settings**
   - **Build command**: `pnpm turbo build`
   - **Publish directory**: `apps/web/.next`
   - **Base directory**: `/`

2. **Environment Variables**
   - Add `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_SITE_URL`

3. **Deploy Convex**
   ```bash
   cd packages/backend
   npx convex deploy
   ```

### Docker Deployment

See the example `Dockerfile` below for containerized deployments.

```dockerfile
# Dockerfile (create in repository root)
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm turbo build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "--filter", "web", "start"]
```

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | `https://abc-123.convex.cloud` |
| `NEXT_PUBLIC_SITE_URL` | Your production domain | `https://yourdomain.com` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |

## Post-Deployment Tasks

### 1. Verify Deployment

- [ ] Visit your production URL
- [ ] Test task creation, updating, and deletion
- [ ] Check real-time updates across browser tabs
- [ ] Test error states and loading states
- [ ] Verify SEO metadata (view page source, check `<head>` tags)

### 2. SEO Setup

- [ ] Submit sitemap to Google Search Console
  - URL: `https://yourdomain.com/sitemap.xml`
  - [Google Search Console](https://search.google.com/search-console)

- [ ] Verify robots.txt accessibility
  - URL: `https://yourdomain.com/robots.txt`

- [ ] Test OpenGraph preview
  - [OpenGraph Debugger](https://www.opengraph.xyz/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 3. Performance Monitoring

#### Recommended Services

1. **Error Tracking**: [Sentry](https://sentry.io)
   ```bash
   pnpm add @sentry/nextjs
   # Follow Sentry Next.js setup guide
   ```

2. **Analytics**: [Vercel Analytics](https://vercel.com/analytics) or [Google Analytics](https://analytics.google.com)

3. **Performance Monitoring**: [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

4. **Real User Monitoring**: [LogRocket](https://logrocket.com)

### 4. Security Hardening

- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Review Content Security Policy headers
- [ ] Set up DDoS protection (Cloudflare, Vercel Pro)
- [ ] Configure rate limiting (consider Convex rate limiting)
- [ ] Implement authentication if needed (next-auth, Clerk, etc.)

## Convex Production Best Practices

### 1. Deployment Workflow

```bash
# Deploy backend first
cd packages/backend
npx convex deploy

# Then deploy frontend with updated CONVEX_URL
# Update environment variable in your hosting platform
# Trigger frontend redeployment
```

### 2. Monitoring Convex

- Dashboard: [https://dashboard.convex.dev](https://dashboard.convex.dev)
- Monitor:
  - Function execution times
  - Database query performance
  - Real-time connection count
  - Error rates

### 3. Convex Environment Variables

Configure sensitive data in Convex dashboard:
```bash
# Example: API keys, secrets
npx convex env set OPENAI_API_KEY=your-key
npx convex env set STRIPE_SECRET_KEY=your-key
```

## Performance Optimization

### Already Implemented ✅

- ✅ Server-side rendering with App Router
- ✅ Data preloading with `preloadQuery`
- ✅ Suspense boundaries for progressive loading
- ✅ Turbopack for faster dev builds
- ✅ Convex indexes for efficient queries
- ✅ Query result limiting (100 items max)

### Additional Optimizations

1. **Image Optimization**
   ```tsx
   import Image from "next/image"
   // Use Next.js Image component for automatic optimization
   ```

2. **Code Splitting**
   ```tsx
   import dynamic from "next/dynamic"
   const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
     loading: () => <Skeleton />
   })
   ```

3. **Caching Strategy**
   - Configure CDN caching for static assets
   - Use Convex query caching (built-in)
   - Consider ISR for semi-static pages

## Monitoring & Alerts

### Key Metrics to Track

1. **Frontend Performance**
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1

2. **Backend Performance**
   - Convex function execution time < 1s
   - Database query performance
   - Real-time subscription latency

3. **User Experience**
   - Error rates < 1%
   - Page load time < 3s
   - Real-time update latency < 100ms

### Set Up Alerts

- Vercel/Netlify build failures
- High error rates in Sentry
- Performance degradation
- Convex function failures

## Troubleshooting

### Common Issues

1. **"NEXT_PUBLIC_CONVEX_URL is not defined"**
   - Ensure environment variable is set in deployment platform
   - Restart the build process
   - Check `.env.example` for correct format

2. **Real-time updates not working**
   - Verify WebSocket connections are allowed
   - Check CSP headers allow Convex domains
   - Ensure HTTPS is enabled (required for secure WebSockets)

3. **Build failures**
   ```bash
   # Clear caches and rebuild
   pnpm clean
   pnpm install
   pnpm build
   ```

4. **Slow query performance**
   - Check Convex dashboard for slow queries
   - Ensure proper indexes are used
   - Implement pagination for large datasets

## Rollback Strategy

1. **Frontend Rollback**
   - Vercel: Instant rollback from Dashboard → Deployments
   - Netlify: Deploy previous version from Dashboard

2. **Backend Rollback**
   ```bash
   # Convex doesn't have instant rollback
   # Best practice: git revert and redeploy
   cd packages/backend
   git revert HEAD
   npx convex deploy
   ```

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Convex Production Deployment](https://docs.convex.dev/production)
- [Vercel Documentation](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Support & Maintenance

- Monitor Convex dashboard daily
- Review error tracking weekly
- Update dependencies monthly
- Review security advisories continuously

---

**Need Help?**
- Convex Discord: [https://convex.dev/community](https://convex.dev/community)
- Next.js Discord: [https://nextjs.org/discord](https://nextjs.org/discord)
