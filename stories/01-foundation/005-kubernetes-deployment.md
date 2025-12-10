# 005 - Kubernetes Deployment

**Epic:** Foundation
**Priority:** Must
**Estimated Effort:** 8 hours
**Phase:** 1

## User Story

As a **DevOps engineer**
I want **Kubernetes manifests for deploying the cycling club application**
So that **the application can be deployed to our K8s cluster with HTTPS and proper resource management**

## Description

Create Kubernetes deployment manifests for the Next.js application, including Deployment, Service, Ingress, and Secret resources. The setup should support HTTPS via cert-manager, proper resource limits, and connection to a PostgreSQL database.

The deployment should be production-ready with health checks, proper scaling, and secure secret management.

## Acceptance Criteria

- [ ] Dockerfile created for Next.js application
- [ ] Kubernetes Deployment manifest created
- [ ] Kubernetes Service manifest created
- [ ] Kubernetes Ingress manifest created with HTTPS
- [ ] Kubernetes Secret manifest template created
- [ ] Resource limits defined (CPU and memory)
- [ ] Health checks configured (liveness and readiness probes)
- [ ] Environment variables properly configured
- [ ] Deployment supports 2 replicas for high availability
- [ ] Documentation for deployment process created

## Technical Implementation

### Database Changes

None (assumes PostgreSQL is already running in K8s cluster)

### API Endpoints

None (infrastructure only)

### Components/Pages

None (infrastructure only)

### Libraries/Dependencies

None (uses Docker and Kubernetes)

### Dockerfile

Create `/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Update `next.config.js` to enable standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Kubernetes Manifests

Create `/k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cycling-club
```

Create `/k8s/secret.yaml.example`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cycling-club-secrets
  namespace: cycling-club
type: Opaque
stringData:
  database-url: "postgresql://user:password@postgres-service:5432/cycling_club?schema=public"
  nextauth-secret: "generate-with-openssl-rand-base64-32"
  google-client-id: "your-google-client-id.apps.googleusercontent.com"
  google-client-secret: "your-google-client-secret"
```

Create `/k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cycling-club-web
  namespace: cycling-club
  labels:
    app: cycling-club-web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cycling-club-web
  template:
    metadata:
      labels:
        app: cycling-club-web
    spec:
      containers:
      - name: web
        image: your-registry/cycling-club:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: nextauth-secret
        - name: NEXTAUTH_URL
          value: "https://club.yourdomain.be"
        - name: GOOGLE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: google-client-id
        - name: GOOGLE_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: google-client-secret
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      restartPolicy: Always
```

Create `/k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cycling-club-web
  namespace: cycling-club
  labels:
    app: cycling-club-web
spec:
  type: ClusterIP
  selector:
    app: cycling-club-web
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
```

Create `/k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cycling-club-ingress
  namespace: cycling-club
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - club.yourdomain.be
    secretName: cycling-club-tls
  rules:
  - host: club.yourdomain.be
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cycling-club-web
            port:
              number: 80
```

### Health Check Endpoint

Create `/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
```

### Deployment Scripts

Create `/scripts/deploy.sh`:

```bash
#!/bin/bash

# Deployment script for cycling club application

set -e

# Configuration
REGISTRY="your-registry"
IMAGE_NAME="cycling-club"
VERSION=${1:-latest}
NAMESPACE="cycling-club"

echo "Building Docker image..."
docker build -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} .

echo "Pushing to registry..."
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo "Waiting for deployment to roll out..."
kubectl rollout status deployment/cycling-club-web -n ${NAMESPACE}

echo "Deployment complete!"
echo "Application should be available at: https://club.yourdomain.be"
```

Make script executable:
```bash
chmod +x scripts/deploy.sh
```

### .dockerignore

Create `/.dockerignore`:

```
.git
.gitignore
.next
node_modules
npm-debug.log
.env.local
.env.*.local
README.md
.vscode
.idea
k8s
scripts
stories
*.md
```

## Dependencies

- **Depends on:** 001 - Project Setup, 002 - Database Schema
- **Blocks:** Production deployment

## UI/UX Notes

Not applicable (infrastructure only)

## Testing Considerations

- [ ] Docker image builds successfully
- [ ] Container runs locally with docker run
- [ ] Health check endpoint returns 200 when healthy
- [ ] Health check endpoint returns 503 when database is down
- [ ] Kubernetes deployment applies without errors
- [ ] Pods start and become ready
- [ ] Service routes traffic to pods
- [ ] Ingress creates HTTPS certificate
- [ ] Application accessible via HTTPS URL
- [ ] Environment variables loaded correctly
- [ ] Database connection works from pod
- [ ] Liveness probe prevents unhealthy pods
- [ ] Readiness probe prevents traffic to starting pods

## Implementation Steps

1. Create Dockerfile with multi-stage build
2. Update next.config.js for standalone output
3. Create Kubernetes namespace manifest
4. Create secret manifest template (with example values)
5. Create deployment manifest with health checks
6. Create service manifest
7. Create ingress manifest with cert-manager annotations
8. Create health check API endpoint
9. Create deployment script
10. Create .dockerignore file
11. Test Docker build locally
12. Test Kubernetes deployment in staging
13. Document deployment process

## Environment Variables Checklist

**Required for Deployment:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Public URL of application
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NODE_ENV` - Set to "production"

## Resource Requirements

**Per Pod:**
- **Memory Request:** 256Mi
- **Memory Limit:** 512Mi
- **CPU Request:** 100m
- **CPU Limit:** 500m

**For 2 Replicas:**
- **Total Memory:** 512Mi request, 1Gi limit
- **Total CPU:** 200m request, 1 CPU limit

## Prerequisites

Before deploying:
- [ ] PostgreSQL database running in cluster
- [ ] cert-manager installed for HTTPS certificates
- [ ] nginx-ingress-controller installed
- [ ] Docker registry credentials configured
- [ ] DNS record pointing to cluster
- [ ] All secrets created from secret.yaml.example

## Deployment Process

```bash
# 1. Build and push image
./scripts/deploy.sh v1.0.0

# 2. Verify deployment
kubectl get pods -n cycling-club
kubectl logs -f deployment/cycling-club-web -n cycling-club

# 3. Check health
curl https://club.yourdomain.be/api/health

# 4. Monitor
kubectl get ingress -n cycling-club
kubectl describe ingress cycling-club-ingress -n cycling-club
```

## Rollback Process

```bash
# View deployment history
kubectl rollout history deployment/cycling-club-web -n cycling-club

# Rollback to previous version
kubectl rollout undo deployment/cycling-club-web -n cycling-club

# Rollback to specific revision
kubectl rollout undo deployment/cycling-club-web -n cycling-club --to-revision=2
```

## Monitoring and Logging

**View Logs:**
```bash
# All pods
kubectl logs -f deployment/cycling-club-web -n cycling-club

# Specific pod
kubectl logs -f cycling-club-web-xxxx-yyyy -n cycling-club

# Previous instance (if crashed)
kubectl logs cycling-club-web-xxxx-yyyy -n cycling-club --previous
```

**Check Pod Status:**
```bash
kubectl get pods -n cycling-club
kubectl describe pod cycling-club-web-xxxx-yyyy -n cycling-club
```

## Scaling

```bash
# Scale up
kubectl scale deployment/cycling-club-web --replicas=3 -n cycling-club

# Scale down
kubectl scale deployment/cycling-club-web --replicas=1 -n cycling-club
```

## Notes

- **cert-manager:** Assumes Let's Encrypt cluster issuer named "letsencrypt-prod" exists
- **Image Registry:** Replace "your-registry" with actual registry URL
- **Domain:** Replace "club.yourdomain.be" with actual domain
- **Database:** PostgreSQL should be accessible from cycling-club namespace
- **Secrets Management:** Never commit actual secret.yaml - use secret.yaml.example
- **Health Checks:** Adjust timing based on actual startup time after testing
- **Resource Limits:** Monitor actual usage and adjust if needed
