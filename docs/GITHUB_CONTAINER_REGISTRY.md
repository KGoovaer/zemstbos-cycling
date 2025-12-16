# GitHub Container Registry Setup

This project uses GitHub Container Registry (ghcr.io) to host Docker images.

## Automatic Builds with GitHub Actions

The repository is configured to automatically build and publish Docker images:

- **On push to main:** Builds and pushes image tagged as `main`
- **On version tag (v*):** Builds and pushes with semantic version tags
- **On pull request:** Builds image but doesn't push (validation only)

### Image Tags

When you create a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will create the following image tags:
- `ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0` (full version)
- `ghcr.io/kgoovaer/zemstbos-cycling:1.0` (major.minor)
- `ghcr.io/kgoovaer/zemstbos-cycling:1` (major)
- `ghcr.io/kgoovaer/zemstbos-cycling:sha-abc1234` (commit SHA)

### Workflow File

Location: `.github/workflows/docker-publish.yml`

The workflow uses:
- `docker/build-push-action` for building
- `docker/metadata-action` for tag generation
- GitHub's built-in `GITHUB_TOKEN` for authentication (no secrets needed!)
- Docker BuildKit cache for faster builds

## Manual Publishing

If you need to manually build and push:

### 1. Authenticate with GitHub Container Registry

```bash
# Create a Personal Access Token (PAT) with 'write:packages' scope
# https://github.com/settings/tokens/new

echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### 2. Build the image

```bash
docker build -t ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0 .
```

### 3. Push to registry

```bash
docker push ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0
```

## Deploy Specific Version

Update `k8s/deployment.yaml` to use a specific version:

```yaml
containers:
- name: web
  image: ghcr.io/kgoovaer/zemstbos-cycling:v1.0.0  # Specific version
  # OR
  image: ghcr.io/kgoovaer/zemstbos-cycling:latest  # Latest build from main
```

Then deploy:
```bash
./scripts/deploy.sh
```

Or manually:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout restart deployment/cycling-club-web -n cycling-club
```

## Image Visibility

By default, GitHub Container Registry images are **private**. To make them public:

1. Go to https://github.com/users/KGoovaer/packages/container/zemstbos-cycling/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Public"

**Note:** Public images can be pulled without authentication, which is easier for deployment.

## Using the Deploy Script

The deploy script is now configured for ghcr.io:

```bash
# Deploy with version tag
./scripts/deploy.sh v1.0.0

# Deploy with latest
./scripts/deploy.sh latest

# Deploy with custom tag
./scripts/deploy.sh main
```

The script will:
1. Build image as `ghcr.io/kgoovaer/zemstbos-cycling:VERSION`
2. Push to GitHub Container Registry
3. Apply Kubernetes manifests
4. Wait for rollout to complete

## Kubernetes Image Pull Secrets (if private)

If your image is private, Kubernetes needs credentials to pull it:

### Create Image Pull Secret

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=KGoovaer \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=your-email@example.com \
  -n cycling-club
```

### Update Deployment

Add to `k8s/deployment.yaml`:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
      - name: ghcr-secret
      containers:
      - name: web
        image: ghcr.io/kgoovaer/zemstbos-cycling:latest
```

## Viewing Published Images

- **Package page:** https://github.com/KGoovaer/zemstbos-cycling/pkgs/container/zemstbos-cycling
- **All packages:** https://github.com/KGoovaer?tab=packages

## Troubleshooting

### Image not found
- Check if image was pushed: Visit package page on GitHub
- Verify image name and tag are correct
- For private images, ensure `imagePullSecrets` is configured

### Authentication failed
- Regenerate Personal Access Token with `write:packages` scope
- Re-login: `docker login ghcr.io`
- Check token hasn't expired

### GitHub Actions build failed
- Check workflow runs: https://github.com/KGoovaer/zemstbos-cycling/actions
- Review build logs for errors
- Ensure Dockerfile is valid

## Best Practices

1. **Use semantic versioning** for releases (v1.0.0, v1.1.0, etc.)
2. **Tag stable releases** instead of using `latest` in production
3. **Make images public** to avoid authentication issues in K8s
4. **Review Actions logs** after each push to ensure builds succeed
5. **Use cache layers** (already configured) for faster builds

## Resources

- [GitHub Container Registry docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Managing package access](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
