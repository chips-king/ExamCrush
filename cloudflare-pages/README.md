# ExamCrush Cloudflare Pages Proxy

This directory is a Cloudflare Pages advanced-mode Function proxy for the Vercel deployment.

It keeps the existing Next.js, Prisma, Neon, and Vercel setup unchanged while exposing the app through a Cloudflare Pages domain.

Deploy:

```bash
npx wrangler pages deploy cloudflare-pages --project-name examcrush
```
