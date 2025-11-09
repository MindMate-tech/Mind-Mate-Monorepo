# Vercel Deployment Fix - TypeScript Errors

## Problem

TypeScript errors were occurring during Vercel deployment:
```
api/avatar/route.ts(1,43): error TS2307: Cannot find module 'next/server'
api/token/route.ts(1,43): error TS2307: Cannot find module 'next/server'
```

## Root Cause

The project is a **Vite React app**, but the API routes were using **Next.js App Router** syntax (`api/avatar/route.ts` and `api/token/route.ts`). These files were being picked up by TypeScript but Next.js wasn't properly configured for this project.

## Solution

### 1. Converted to Vercel Serverless Functions

Converted the Next.js route files to Vercel serverless function format:

- **Before**: `api/avatar/route.ts` (Next.js App Router format)
- **After**: `api/avatar.ts` (Vercel serverless function format)

- **Before**: `api/token/route.ts` (Next.js App Router format)  
- **After**: `api/token.ts` (Vercel serverless function format)

### 2. Updated TypeScript Configuration

Added exclusion for old Next.js route files in `tsconfig.json`:
```json
{
  "exclude": ["api/**/route.ts"]
}
```

### 3. Removed Dependencies on Next.js Types

The new functions use custom TypeScript interfaces instead of `@vercel/node` or `next/server`:

```typescript
interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
}
```

## How It Works

### Development (Local)
- Vite's dev server middleware handles `/api/token` and `/api/avatar` routes
- Configured in `vite.config.ts` via the `livekit-api` plugin

### Production (Vercel)
- Vercel automatically detects files in the `api/` directory
- Each file becomes a serverless function
- `api/token.ts` → `/api/token` endpoint
- `api/avatar.ts` → `/api/avatar` endpoint

## Files Changed

1. ✅ Created `api/token.ts` (Vercel serverless function)
2. ✅ Created `api/avatar.ts` (Vercel serverless function)
3. ✅ Deleted `api/token/route.ts` (old Next.js route)
4. ✅ Deleted `api/avatar/route.ts` (old Next.js route)
5. ✅ Updated `tsconfig.json` to exclude old route files
6. ✅ Removed empty `api/token/` and `api/avatar/` directories

## Testing

The functions should work identically to before:

- **GET** `/api/token?room=xxx&username=yyy` - Generates LiveKit token
- **POST** `/api/avatar` - Creates Beyond Presence avatar session

## Notes

- The `next` package is still in `package.json` but is not required for these API functions
- You can optionally remove it if not used elsewhere, but it won't cause issues if left
- Vite middleware in `vite.config.ts` handles these routes in development
- Vercel serverless functions handle them in production

## Deployment

After these changes, Vercel should:
1. ✅ Build without TypeScript errors
2. ✅ Deploy the serverless functions correctly
3. ✅ Route API requests to the appropriate functions

