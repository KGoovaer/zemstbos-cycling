# Kubernetes Deployment Implementation Summary

**Story:** 005-kubernetes-deployment
**Date:** 2025-12-16
**Status:** ✅ Complete

## Files Created

### Docker Configuration
- ✅ `/Dockerfile` - Multi-stage build for Next.js application
- ✅ `/.dockerignore` - Excludes unnecessary files from Docker image

### Kubernetes Manifests (`/k8s/`)
- ✅ `namespace.yaml` - Creates cycling-club namespace
- ✅ `secret.yaml.example` - Template for secrets configuration
- ✅ `persistent-volume-claim.yaml` - 5Gi PVC for SQLite database
- ✅ `deployment.yaml` - 2-replica deployment with health checks
- ✅ `service.yaml` - ClusterIP service
- ✅ `ingress.yaml` - HTTPS ingress with cert-manager
- ✅ `backup-cronjob.yaml` - Automated daily backups

### Application Code
- ✅ `/app/api/health/route.ts` - Health check endpoint for Kubernetes probes

### Scripts
- ✅ `/scripts/deploy.sh` - Automated deployment script (executable)

### Documentation
- ✅ `/docs/KUBERNETES_DEPLOYMENT.md` - Complete deployment guide

### Configuration Updates
- ✅ `next.config.js` - Added `output: 'standalone'` for Docker

## Key Features Implemented

### Docker Support
- Multi-stage build (builder + runner)
- Non-root user (nextjs:nodejs)
- Optimized image size with standalone output
- Proper file permissions and ownership

### Kubernetes Resources
- **Deployment:** 2 replicas for HA, init container for DB setup
- **Service:** ClusterIP on port 80 → 3000
- **Ingress:** HTTPS with Let's Encrypt via cert-manager
- **PVC:** ReadWriteMany storage for SQLite (5Gi)
- **Secrets:** Environment variables via K8s secrets
- **Health Checks:** Liveness and readiness probes

### Resource Configuration
- Memory: 256Mi request, 512Mi limit per pod
- CPU: 100m request, 500m limit per pod
- Total for 2 replicas: 512Mi/1Gi memory, 200m/1 CPU

### Health Monitoring
- `/api/health` endpoint returns 200 when healthy
- Returns 503 when database connection fails
- Used by both liveness and readiness probes

### Backup Strategy
- CronJob for daily automated backups at 2 AM
- Keeps last 7 days of backups
- VACUUM optimization on backup files
- Manual backup and restore procedures documented

### Database Management
- Init container automatically runs migrations on startup
- SQLite database on persistent storage (RWX required)
- Survives pod restarts and redeployments
- Manual operations via kubectl exec

## Configuration Required Before Deployment

1. **Generate NextAuth Secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Create Actual Secrets:**
   ```bash
   cp k8s/secret.yaml.example k8s/secret.yaml
   # Edit with real values
   ```

3. **Update Deployment YAML:**
   - Replace `your-registry` with Docker registry URL
   - Update image pull policy if needed

4. **Update Ingress YAML:**
   - Replace `club.yourdomain.be` with actual domain

5. **Update PVC YAML:**
   - Set correct `storageClassName` for your cluster
   - Check available: `kubectl get storageclass`

## Testing Checklist

- [ ] Docker image builds successfully
- [ ] Container runs locally: `docker run -p 3000:3000 <image>`
- [ ] Health check endpoint accessible: `curl http://localhost:3000/api/health`
- [ ] Kubernetes manifests apply without errors
- [ ] Pods start and become ready
- [ ] Init container completes successfully
- [ ] Database migrations run
- [ ] Service routes traffic correctly
- [ ] Ingress creates TLS certificate
- [ ] Application accessible via HTTPS
- [ ] Environment variables loaded correctly
- [ ] Liveness probe prevents unhealthy pods
- [ ] Readiness probe prevents traffic to starting pods

## Acceptance Criteria Met

- ✅ Dockerfile created for Next.js application
- ✅ Kubernetes Deployment manifest created
- ✅ Kubernetes Service manifest created
- ✅ Kubernetes Ingress manifest created with HTTPS
- ✅ Kubernetes Secret manifest template created
- ✅ PersistentVolume and PersistentVolumeClaim created for SQLite database
- ✅ Resource limits defined (CPU and memory)
- ✅ Health checks configured (liveness and readiness probes)
- ✅ Environment variables properly configured
- ✅ Deployment supports 2 replicas for high availability
- ✅ Documentation for deployment process created

## Deployment Commands

### Build and Deploy
```bash
./scripts/deploy.sh v1.0.0
```

### Verify Deployment
```bash
kubectl get all -n cycling-club
kubectl logs -f deployment/cycling-club-web -n cycling-club
curl https://club.yourdomain.be/api/health
```

### Monitor
```bash
kubectl get pods -n cycling-club -w
kubectl top pods -n cycling-club
```

## Next Steps

1. Set up Docker registry if not already available
2. Configure DNS record for the domain
3. Ensure cert-manager and nginx-ingress are installed in cluster
4. Verify StorageClass supports ReadWriteMany (NFS/CephFS)
5. Create actual secrets from template
6. Test deployment in staging environment first
7. Monitor resource usage and adjust limits if needed

## Notes

- The deployment uses SQLite with persistent storage, not PostgreSQL
- ReadWriteMany (RWX) storage is required for multiple replicas
- Init container handles database migrations automatically
- Backup CronJob is optional but recommended
- Health endpoint uses Prisma's `$queryRaw` for database connectivity check
- Standalone output mode generates self-contained Next.js bundle

## Related Documentation

- [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT.md)
- [Story 005](../stories/01-foundation/005-kubernetes-deployment.md)
