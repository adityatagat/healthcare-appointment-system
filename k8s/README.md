# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Healthcare Appointment System API Gateway.

## Prerequisites

- Kubernetes cluster (v1.19+)
- `kubectl` configured to communicate with your cluster
- Helm (v3.0.0+)
- Ingress controller (e.g., nginx-ingress)
- Cert-manager (for TLS certificates)
- Redis (for rate limiting and session storage)

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create ConfigMap

Update `configmap.yaml` with your configuration:

```bash
kubectl apply -f configmap.yaml -n healthcare-app
```

### 3. Create Secrets

Create a `secrets.enc.yaml` file with your sensitive data (use `sops` or similar to encrypt):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-gateway-secrets
type: Opaque
data:
  ADMIN_API_KEY: $(echo -n "your-admin-key" | base64)
  USER_API_KEY: $(echo -n "your-user-key" | base64)
  JWT_SECRET: $(echo -n "your-jwt-secret" | base64)
```

Apply the secrets:

```bash
kubectl apply -f secrets.enc.yaml -n healthcare-app
```

### 4. Deploy the Application

#### Using Helm (Recommended)

```bash
helm upgrade --install api-gateway ./charts/api-gateway \
  --namespace healthcare-app \
  --set image.tag=latest \
  --set secrets.adminApiKey="your-admin-key" \
  --set secrets.userApiKey="your-user-key" \
  --set secrets.jwtSecret="your-jwt-secret"
```

#### Using kubectl

```bash
kubectl apply -f deployment.yaml -n healthcare-app
kubectl apply -f service.yaml -n healthcare-app
kubectl apply -f ingress.yaml -n healthcare-app
```

### 5. Verify Deployment

```bash
kubectl get pods -n healthcare-app
kubectl get svc -n healthcare-app
kubectl get ingress -n healthcare-app
```

## Blue-Green Deployment

The deployment is configured for blue-green deployments. To switch between blue and green:

```bash
# Get current active service
kubectl get svc api-gateway -n healthcare-app -o jsonpath='{.spec.selector.app.kubernetes.io/color}'

# Update the service to point to the new color
kubectl patch svc api-gateway -n healthcare-app -p '{"spec":{"selector":{"app.kubernetes.io/color":"green"}}}'
```

## Monitoring

View logs:

```bash
kubectl logs -l app.kubernetes.io/name=api-gateway -n healthcare-app
```

Port-forward for local access:

```bash
kubectl port-forward svc/api-gateway 8000:80 -n healthcare-app
```

## Cleanup

To delete the deployment:

```bash
# Using Helm
helm uninstall api-gateway -n healthcare-app

# Using kubectl
kubectl delete -f . -n healthcare-app
```

## Troubleshooting

### Common Issues

1. **Pods not starting**:
   - Check resource limits
   - Verify secrets and configmaps are correctly mounted
   - Check container logs

2. **Service not accessible**:
   - Verify service selectors match pod labels
   - Check ingress controller logs
   - Verify network policies

3. **TLS/SSL issues**:
   - Verify cert-manager is running
   - Check certificate status: `kubectl get certificate -n healthcare-app`
   - Check certificate events: `kubectl describe certificate api-tls-secret -n healthcare-app`
