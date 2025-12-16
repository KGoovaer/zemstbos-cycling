# Kubernetes Deployment Guide

This guide covers deploying the Cycling Club application to a Kubernetes cluster with HTTPS support and SQLite database on persistent storage.

## Prerequisites

Before deploying, ensure you have:

- [ ] Kubernetes cluster with dynamic storage provisioner (NFS/iSCSI/Ceph)
- [ ] StorageClass configured and available (check with `kubectl get storageclass`)
- [ ] cert-manager installed for HTTPS certificates
- [ ] nginx-ingress-controller installed
- [ ] Docker registry credentials configured
- [ ] DNS record pointing to cluster
- [ ] All secrets created from `k8s/secret.yaml.example`

## Quick Start

1. **Generate NextAuth secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Create actual secrets file:**
   ```bash
   cp k8s/secret.yaml.example k8s/secret.yaml
   # Edit k8s/secret.yaml with your actual values
   ```

3. **Update configuration:**
   - Docker registry is pre-configured for GitHub Container Registry (`ghcr.io/kgoovaer/zemstbos-cycling`)
   - Replace `club.yourdomain.be` in `k8s/ingress.yaml` with your domain
   - Update `storageClassName` in `k8s/persistent-volume-claim.yaml` to match your cluster

4. **Deploy:**
   ```bash
   ./scripts/deploy.sh v1.0.0
   ```

## Storage Configuration

### Check Available Storage Classes

```bash
kubectl get storageclass
```

Common storage class names:
- **NFS:** `nfs-client`, `nfs`, `managed-nfs-storage`
- **iSCSI:** `iscsi`, `openebs-iscsi`
- **Ceph:** `ceph-rbd`, `rook-ceph-block`
- **Cloud Providers:** `standard`, `gp2`, `pd-standard`

Update the `storageClassName` in `k8s/persistent-volume-claim.yaml` to match your cluster's available storage.

**Important:** The storage class must support `ReadWriteMany` (RWX) access mode for multiple pods to access the SQLite database.

## Deployment Process

### 1. Build and Push Docker Image

**Option A: Automatic (Recommended)**

Push to GitHub and let Actions build automatically:
```bash
git tag v1.0.0
git push origin v1.0.0
```

See [GITHUB_CONTAINER_REGISTRY.md](./GITHUB_CONTAINER_REGISTRY.md) for details.

**Option B: Manual Build**

```bash
# Build image
docker build -t ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0 .

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u KGoovaer --password-stdin

# Push to registry
docker push ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0
```

**Option C: Use Deploy Script**
```bash
./scripts/deploy.sh v1.0.0
```

### 2. Create Kubernetes Resources

```bash
# Apply manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/persistent-volume-claim.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check PVC is bound
kubectl get pvc -n cycling-club
# Should show: cycling-club-db-pvc   Bound   ...

# Check pods are running
kubectl get pods -n cycling-club

# Check init container logs (database setup)
kubectl logs -n cycling-club -l app=cycling-club-web -c db-init

# Check application logs
kubectl logs -f deployment/cycling-club-web -n cycling-club

# Check health endpoint
curl https://club.yourdomain.be/api/health
```

### 4. Monitor Ingress

```bash
kubectl get ingress -n cycling-club
kubectl describe ingress cycling-club-ingress -n cycling-club
```

## Database Management

### Initial Setup

The deployment uses an **init container** to automatically handle database setup:

1. **First deployment:** Init container runs `prisma migrate deploy` to create tables
2. **Subsequent deployments:** Migrations are applied only if needed
3. **Seed data:** Optional seeding with `prisma db seed` (fails silently if not configured)

### Manual Database Operations

```bash
# Get a shell in a running pod
kubectl exec -it -n cycling-club deployment/cycling-club-web -- sh

# Run migrations manually
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Access SQLite directly
sqlite3 /data/cycling_club.db
```

## Backup and Recovery

### Manual Backup

```bash
# Create a one-time backup
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: cycling-club-backup-$(date +%Y%m%d-%H%M%S)
  namespace: cycling-club
spec:
  template:
    spec:
      containers:
      - name: backup
        image: alpine:latest
        command:
        - sh
        - -c
        - |
          apk add --no-cache sqlite
          cp /data/cycling_club.db /backup/cycling_club-$(date +%Y%m%d-%H%M%S).db
          sqlite3 /backup/cycling_club-$(date +%Y%m%d-%H%M%S).db "VACUUM;"
          ls -lh /backup/
        volumeMounts:
        - name: db-storage
          mountPath: /data
          readOnly: true
        - name: backup-storage
          mountPath: /backup
      volumes:
      - name: db-storage
        persistentVolumeClaim:
          claimName: cycling-club-db-pvc
      - name: backup-storage
        # Configure your backup destination
        persistentVolumeClaim:
          claimName: cycling-club-backup-pvc
      restartPolicy: OnFailure
EOF
```

### Automated Backups

Deploy the backup CronJob for daily automated backups:

```bash
kubectl apply -f k8s/backup-cronjob.yaml
```

This creates daily backups at 2 AM and keeps the last 7 days of backups.

### Restore from Backup

```bash
# 1. Scale down the application
kubectl scale deployment/cycling-club-web --replicas=0 -n cycling-club

# 2. Create a restore job (replace BACKUP_FILE with actual backup)
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: cycling-club-restore-$(date +%Y%m%d-%H%M%S)
  namespace: cycling-club
spec:
  template:
    spec:
      containers:
      - name: restore
        image: alpine:latest
        command:
        - sh
        - -c
        - |
          BACKUP_FILE="/backup/cycling_club-20231216-020000.db"
          cp "\$BACKUP_FILE" /data/cycling_club.db
          echo "Database restored from \$BACKUP_FILE"
        volumeMounts:
        - name: db-storage
          mountPath: /data
        - name: backup-storage
          mountPath: /backup
          readOnly: true
      volumes:
      - name: db-storage
        persistentVolumeClaim:
          claimName: cycling-club-db-pvc
      - name: backup-storage
        persistentVolumeClaim:
          claimName: cycling-club-backup-pvc
      restartPolicy: OnFailure
EOF

# 3. Wait for restore to complete
kubectl wait --for=condition=complete --timeout=300s job/cycling-club-restore-* -n cycling-club

# 4. Scale application back up
kubectl scale deployment/cycling-club-web --replicas=2 -n cycling-club
```

## Scaling

```bash
# Scale up
kubectl scale deployment/cycling-club-web --replicas=3 -n cycling-club

# Scale down
kubectl scale deployment/cycling-club-web --replicas=1 -n cycling-club
```

## Rollback

```bash
# View deployment history
kubectl rollout history deployment/cycling-club-web -n cycling-club

# Rollback to previous version
kubectl rollout undo deployment/cycling-club-web -n cycling-club

# Rollback to specific revision
kubectl rollout undo deployment/cycling-club-web -n cycling-club --to-revision=2
```

## Monitoring and Logging

### View Logs

```bash
# All pods
kubectl logs -f deployment/cycling-club-web -n cycling-club

# Specific pod
kubectl logs -f cycling-club-web-xxxx-yyyy -n cycling-club

# Previous instance (if crashed)
kubectl logs cycling-club-web-xxxx-yyyy -n cycling-club --previous
```

### Check Pod Status

```bash
kubectl get pods -n cycling-club
kubectl describe pod cycling-club-web-xxxx-yyyy -n cycling-club
```

### Health Checks

```bash
# Internal health check
kubectl exec -it -n cycling-club deployment/cycling-club-web -- wget -O- http://localhost:3000/api/health

# External health check
curl https://club.yourdomain.be/api/health
```

## Resource Requirements

**Per Pod:**
- Memory Request: 256Mi
- Memory Limit: 512Mi
- CPU Request: 100m
- CPU Limit: 500m

**For 2 Replicas:**
- Total Memory: 512Mi request, 1Gi limit
- Total CPU: 200m request, 1 CPU limit

Monitor actual usage and adjust if needed:
```bash
kubectl top pods -n cycling-club
```

## Environment Variables

The following environment variables are configured via Kubernetes secrets:

- `DATABASE_URL` - SQLite database file path (e.g., file:/data/cycling_club.db)
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Public URL of application
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NODE_ENV` - Set to "production"

## Troubleshooting

### Pod won't start

```bash
# Check pod events
kubectl describe pod <pod-name> -n cycling-club

# Check logs
kubectl logs <pod-name> -n cycling-club

# Check init container logs
kubectl logs <pod-name> -n cycling-club -c db-init
```

### Database issues

```bash
# Check PVC status
kubectl get pvc -n cycling-club

# Check volume mount
kubectl exec -it -n cycling-club deployment/cycling-club-web -- ls -la /data

# Test database access
kubectl exec -it -n cycling-club deployment/cycling-club-web -- sqlite3 /data/cycling_club.db "SELECT 1"
```

### Ingress not working

```bash
# Check ingress status
kubectl get ingress -n cycling-club
kubectl describe ingress cycling-club-ingress -n cycling-club

# Check certificate
kubectl get certificate -n cycling-club
kubectl describe certificate cycling-club-tls -n cycling-club

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### Service connectivity

```bash
# Test service from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -n cycling-club -- sh
# Inside pod:
apk add curl
curl http://cycling-club-web/api/health
```

## Security Notes

- Never commit `k8s/secret.yaml` with actual secrets
- Use `k8s/secret.yaml.example` as a template only
- Rotate secrets regularly
- Ensure RBAC is properly configured
- Keep cert-manager and ingress controller updated
- Monitor for security vulnerabilities in base images

## Performance Optimization

- Adjust resource limits based on actual usage
- Enable horizontal pod autoscaling if needed
- Configure caching strategies
- Optimize database queries
- Use CDN for static assets

## High Availability

The deployment is configured for high availability with:
- 2 replicas by default
- ReadWriteMany persistent storage
- Liveness and readiness probes
- Rolling update strategy
- Pod anti-affinity (can be added if needed)

## Notes

- **SQLite Concurrency:** SQLite handles concurrent reads well, but writes are serialized
- **Storage Backend:** Must support ReadWriteMany (RWX) - typically NFS, CephFS, or similar
- **Data Persistence:** Database survives pod restarts and redeployments as data is on PVC
- **Backup Strategy:** Use CronJob for automated daily backups to separate PVC or external storage
- **Health Checks:** Adjust timing based on actual startup time after testing
- **Resource Limits:** Monitor actual usage and adjust if needed
