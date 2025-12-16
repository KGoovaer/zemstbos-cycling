# Docker Build Fix - Prisma DATABASE_URL Issue

## Problem

Docker build was failing with:
```
Failed to load config file "/app" as a TypeScript/JavaScript module. 
Error: PrismaConfigEnvError: Missing required environment variable: DATABASE_URL
```

## Root Cause

The project uses a custom `prisma.config.ts` file that requires `DATABASE_URL` environment variable at build time. During Docker build, this variable wasn't available, causing Prisma to fail when generating the client.

## Solution

Added a dummy `DATABASE_URL` in the Dockerfile build stage:

```dockerfile
# Set dummy DATABASE_URL for build (required by Prisma)
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma Client
RUN npx prisma generate
```

This provides a placeholder value during the build process. The actual `DATABASE_URL` will be provided at runtime via Kubernetes secrets.

## Additional Fix

Also updated ENV syntax to modern format (fixing Docker warnings):

**Before:**
```dockerfile
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
```

**After:**
```dockerfile
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
```

## Testing

After pushing this fix, GitHub Actions will automatically:
1. Build the Docker image with the fixed Dockerfile
2. Push to `ghcr.io/kgoovaer/zemstbos-cycling`

Check build status at: https://github.com/KGoovaer/zemstbos-cycling/actions

## Runtime Behavior

The dummy `DATABASE_URL` from the build stage is **not** used at runtime. The actual database URL comes from Kubernetes secrets:

```yaml
env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: cycling-club-secrets
      key: database-url
```

This ensures the production database path (`file:/data/cycling_club.db`) is used when the container runs in Kubernetes.

## Files Changed

- `Dockerfile` - Added build-time DATABASE_URL and updated ENV syntax

## Status

✅ Fixed - Ready for GitHub Actions build
