#!/bin/bash

# Production Deployment Script for Luxury Wine E-commerce Platform
# This script handles database migrations, backups, and deployment

set -e

# Configuration
NAMESPACE="luxurywines-production"
BACKUP_BUCKET="luxurywines-backups"
DB_HOST="${DATABASE_HOST:-production-db-host}"
DB_NAME="${DATABASE_NAME:-luxurywines_prod}"
DB_USER="${DATABASE_USER:-luxurywines}"
REDIS_HOST="${REDIS_HOST:-production-redis-host}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log "Creating namespace $NAMESPACE..."
        kubectl create namespace $NAMESPACE
    fi
    
    # Check if AWS CLI is installed for backups
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI not found. Backup functionality will be limited."
    fi
    
    success "Prerequisites check completed"
}

# Create database backup
create_backup() {
    log "Creating database backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="luxurywines_backup_${timestamp}.sql"
    
    # Create backup using pg_dump
    kubectl run postgres-backup-${timestamp} \
        --image=postgres:15 \
        --rm -i --restart=Never \
        --namespace=$NAMESPACE \
        --env="PGPASSWORD=${DATABASE_PASSWORD}" \
        -- pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $backup_file
    
    if [ $? -eq 0 ]; then
        success "Database backup created: $backup_file"
        
        # Upload to S3 if AWS CLI is available
        if command -v aws &> /dev/null; then
            log "Uploading backup to S3..."
            aws s3 cp $backup_file s3://$BACKUP_BUCKET/database/
            
            if [ $? -eq 0 ]; then
                success "Backup uploaded to S3"
                rm $backup_file
            else
                warning "Failed to upload backup to S3. Local backup retained."
            fi
        fi
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Create a job to run migrations
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ghcr.io/luxurywines/luxurywines-backend:latest
        command: ["npm", "run", "migrate:deploy"]
        envFrom:
        - configMapRef:
            name: luxurywines-config
        - secretRef:
            name: luxurywines-secrets
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Wait for migration to complete
    local job_name=$(kubectl get jobs -n $NAMESPACE --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')
    kubectl wait --for=condition=complete --timeout=300s job/$job_name -n $NAMESPACE
    
    if [ $? -eq 0 ]; then
        success "Database migrations completed successfully"
        kubectl delete job $job_name -n $NAMESPACE
    else
        error "Database migrations failed"
        kubectl logs job/$job_name -n $NAMESPACE
        exit 1
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application to production..."
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/production/
    
    # Wait for deployments to be ready
    log "Waiting for backend deployment to be ready..."
    kubectl rollout status deployment/backend-deployment -n $NAMESPACE --timeout=600s
    
    log "Waiting for frontend deployment to be ready..."
    kubectl rollout status deployment/frontend-deployment -n $NAMESPACE --timeout=600s
    
    success "Application deployment completed"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check backend health
    local backend_health=$(kubectl run health-check-backend --image=curlimages/curl --rm -i --restart=Never -n $NAMESPACE -- curl -s -o /dev/null -w "%{http_code}" http://backend-service/health)
    
    if [ "$backend_health" = "200" ]; then
        success "Backend health check passed"
    else
        error "Backend health check failed (HTTP $backend_health)"
        exit 1
    fi
    
    # Check frontend health
    local frontend_health=$(kubectl run health-check-frontend --image=curlimages/curl --rm -i --restart=Never -n $NAMESPACE -- curl -s -o /dev/null -w "%{http_code}" http://frontend-service/api/health)
    
    if [ "$frontend_health" = "200" ]; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed (HTTP $frontend_health)"
        exit 1
    fi
    
    success "All health checks passed"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    if command -v aws &> /dev/null; then
        # Keep backups for 30 days
        local cutoff_date=$(date -d "30 days ago" +%Y-%m-%d)
        
        aws s3 ls s3://$BACKUP_BUCKET/database/ | while read -r line; do
            local backup_date=$(echo $line | awk '{print $1}')
            if [[ "$backup_date" < "$cutoff_date" ]]; then
                local backup_file=$(echo $line | awk '{print $4}')
                log "Deleting old backup: $backup_file"
                aws s3 rm s3://$BACKUP_BUCKET/database/$backup_file
            fi
        done
        
        success "Old backups cleaned up"
    else
        warning "AWS CLI not available. Skipping backup cleanup."
    fi
}

# Rollback function
rollback() {
    error "Deployment failed. Initiating rollback..."
    
    # Rollback deployments
    kubectl rollout undo deployment/backend-deployment -n $NAMESPACE
    kubectl rollout undo deployment/frontend-deployment -n $NAMESPACE
    
    # Wait for rollback to complete
    kubectl rollout status deployment/backend-deployment -n $NAMESPACE --timeout=300s
    kubectl rollout status deployment/frontend-deployment -n $NAMESPACE --timeout=300s
    
    warning "Rollback completed"
    exit 1
}

# Main deployment function
main() {
    log "Starting production deployment..."
    
    # Set up error handling
    trap rollback ERR
    
    # Run deployment steps
    check_prerequisites
    create_backup
    run_migrations
    deploy_application
    run_health_checks
    cleanup_old_backups
    
    success "Production deployment completed successfully! 🚀"
    
    # Display deployment information
    echo ""
    log "Deployment Summary:"
    echo "  Frontend URL: https://luxurywines.com"
    echo "  Backend API: https://api.luxurywines.com"
    echo "  Namespace: $NAMESPACE"
    echo ""
    
    # Show running pods
    log "Running pods:"
    kubectl get pods -n $NAMESPACE
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_prerequisites
        create_backup
        ;;
    "migrate")
        check_prerequisites
        run_migrations
        ;;
    "health")
        run_health_checks
        ;;
    "rollback")
        rollback
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {deploy|backup|migrate|health|rollback|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full production deployment (default)"
        echo "  backup   - Create database backup only"
        echo "  migrate  - Run database migrations only"
        echo "  health   - Run health checks only"
        echo "  rollback - Rollback to previous version"
        echo "  cleanup  - Clean up old backups"
        exit 1
        ;;
esac