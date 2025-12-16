# Kubernetes SQLite Deployment Update

## Overview
Updated the Kubernetes deployment configuration to use SQLite with persistent storage on the cluster via NFS or iSCSI, with automatic database initialization.

## Key Changes

### 1. **Storage Configuration**
- **Before:** External storage outside cluster
- **After:** Dynamic provisioning using Kubernetes StorageClass
- **Backend:** NFS, iSCSI, or other RWX-capable storage
- **Benefit:** Integrated with cluster storage management

### 2. **PersistentVolume Removed**
- No longer need manual PV creation
- Uses dynamic provisioning through PVC only
- StorageClass automatically provisions backing storage

### 3. **Init Container Added**
- Automatically runs database migrations on startup
- Ensures database schema is up-to-date
- Optional seeding for initial data
- Runs before main application container

### 4. **Simplified Deployment**
```yaml
# Only need PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cycling-club-db-pvc
  namespace: cycling-club
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: nfs-client  # or your cluster's storage class
  resources:
    requests:
      storage: 5Gi
```

## Storage Requirements

### StorageClass Must Support:
- **ReadWriteMany (RWX)** access mode
- Required for multiple pod replicas
- Typically provided by:
  - NFS (nfs-client provisioner)
  - CephFS (rook-ceph)
  - GlusterFS
  - Cloud provider file storage (EFS, Azure Files, etc.)

### Not Suitable:
- **ReadWriteOnce (RWO)** - Block storage like iSCSI, Ceph RBD
- These only allow single pod access
- Won't work with replicas > 1

## Database Initialization Flow

```
Pod Start
  ↓
Init Container Runs
  ├─→ npx prisma migrate deploy  (create/update schema)
  └─→ npx prisma db seed         (optional initial data)
  ↓
Main Container Starts
  └─→ Application runs with ready database
```

## Deployment Steps

### 1. Check Available Storage Classes
```bash
kubectl get storageclass
```

### 2. Update PVC StorageClassName
Edit `k8s/persistent-volume-claim.yaml`:
```yaml
storageClassName: nfs-client  # Change to your available storage class
```

### 3. Deploy Application
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/persistent-volume-claim.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Database Initialization
```bash
# Check init container logs
kubectl logs -n cycling-club -l app=cycling-club-web -c db-init

# Should see Prisma migration output
```

### 5. Verify Application Running
```bash
kubectl get pods -n cycling-club
# Should show: Running

kubectl logs -f deployment/cycling-club-web -n cycling-club
```

## Backup Strategy

### Automated Daily Backups
```bash
# Deploy backup CronJob
kubectl apply -f k8s/backup-cronjob.yaml
```

Features:
- Runs daily at 2 AM
- Creates timestamped backups
- Vacuums database (optimize file)
- Keeps last 7 days of backups
- Stores to separate PVC

### Manual Backup
```bash
# Copy database file from pod
kubectl exec -n cycling-club deployment/cycling-club-web -- \
  cat /data/cycling_club.db > cycling_club-backup.db
```

## Recovery Process

### Restore from Backup
```bash
# 1. Scale down
kubectl scale deployment/cycling-club-web --replicas=0 -n cycling-club

# 2. Run restore job (see deployment story for full example)

# 3. Scale back up
kubectl scale deployment/cycling-club-web --replicas=2 -n cycling-club
```

## Storage Class Examples

### NFS Dynamic Provisioner
```yaml
storageClassName: nfs-client
```

### Ceph Filesystem
```yaml
storageClassName: cephfs
```

### Cloud Provider
```yaml
# AWS EFS
storageClassName: efs-sc

# Azure Files
storageClassName: azurefile

# GCP Filestore
storageClassName: filestore
```

## Troubleshooting

### PVC Not Binding
```bash
kubectl describe pvc cycling-club-db-pvc -n cycling-club
```

Check for:
- StorageClass exists: `kubectl get storageclass`
- StorageClass supports RWX
- Provisioner is working

### Init Container Failing
```bash
kubectl logs -n cycling-club <pod-name> -c db-init
```

Common issues:
- Missing Prisma migrations in Docker image
- Incorrect DATABASE_URL
- Permission issues on /data directory

### Application Can't Access Database
```bash
kubectl exec -n cycling-club deployment/cycling-club-web -- ls -la /data/
```

Check:
- Database file exists
- Correct permissions
- DATABASE_URL points to /data/cycling_club.db

## Migration from External Storage

If migrating from external storage setup:

1. **Backup existing database**
2. **Deploy new PVC-based setup**
3. **Restore backup to new PVC**
4. **Test application**
5. **Remove old external storage**

## Benefits of This Setup

1. **Automated Setup:** Database ready on first deployment
2. **Integrated:** Uses cluster storage management
3. **Scalable:** Supports multiple replicas with RWX
4. **Persistent:** Data survives pod restarts
5. **Portable:** Move between clusters easily
6. **Backup-Friendly:** Integrated backup jobs
7. **Simple:** No external dependencies

## Limitations

1. **Storage Class Required:** Cluster must have RWX-capable storage
2. **SQLite Write Performance:** Single writer limitation
3. **Not for High-Concurrency:** Better suited for small-medium workloads
4. **Network Storage Overhead:** Slightly slower than local storage

## When to Consider PostgreSQL Instead

Consider migrating to PostgreSQL if:
- High concurrent write load
- Need advanced database features
- Require better performance at scale
- Need built-in replication
- Application grows beyond 1000+ active users

Current SQLite setup is suitable for:
- Small to medium cycling clubs (< 500 members)
- Read-heavy workloads
- Simple deployment requirements
- Limited infrastructure resources
