#!/bin/bash

# Deployment script for cycling club application

set -e

# Configuration
REGISTRY="ghcr.io/kgoovaer"
IMAGE_NAME="zemstbos-cycling"
VERSION=${1:-latest}
NAMESPACE="cycling-club"

echo "Building Docker image..."
docker build -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} .

echo "Pushing to registry..."
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/persistent-volume-claim.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo "Waiting for deployment to roll out..."
kubectl rollout status deployment/cycling-club-web -n ${NAMESPACE}

echo "Deployment complete!"
echo "Application should be available at: https://club.yourdomain.be"
