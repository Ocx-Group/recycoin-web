# RecyCoin Infrastructure

Infraestructura GitOps para desplegar `recycoin-web` en el cluster `ecosystem-prod-k8s`.

## Componentes

- `argocd/project.yaml`: AppProject de ArgoCD.
- `argocd/application.yaml`: Application de ArgoCD apuntando a este repo.
- `k8s/recycoin-web`: manifests Kubernetes del frontend.
- `terraform`: records DNS `recycoin.net` y `www.recycoin.net` hacia el load balancer del cluster.

## Terraform

```powershell
cd Infrastructure/terraform
$env:TF_VAR_do_token = "<DIGITALOCEAN_API_TOKEN>"
terraform init
terraform plan "-var-file=environments/prod.tfvars"
terraform apply "-var-file=environments/prod.tfvars"
```

## CI/CD

El workflow `.github/workflows/deploy-prod.yml`:

1. Construye la imagen Docker.
2. Publica `registry.digitalocean.com/ocx-registry/recycoin-web`.
3. Aplica el AppProject/Application de ArgoCD.
4. Espera el rollout del deployment en Kubernetes.
