# Insurance Lab - Complete Deployment Script
# Usage: .\deploy-all.ps1

Write-Host "🚀 Deploying Insurance Lab (Landing + App)..." -ForegroundColor Cyan

$VPS_IP = "46.224.127.115"
$VPS_USER = "root"

# Step 1: Build React App
Write-Host "`n📦 Building React app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Upload Landing Page
Write-Host "`n📤 Uploading landing page..." -ForegroundColor Yellow
scp public/insurance-lab.ai.html "${VPS_USER}@${VPS_IP}:/root/insurance-lab-deploy/landing/index.html"
scp public/logo-horizontal.png "${VPS_USER}@${VPS_IP}:/root/insurance-lab-deploy/landing/logo-horizontal.png"

# Step 3: Upload React App to /frontend/ (NOT /app/)
Write-Host "`n📤 Uploading React app to /frontend/..." -ForegroundColor Yellow
scp -r dist/* "${VPS_USER}@${VPS_IP}:/root/insurance-lab-deploy/frontend/"

# Step 4: Restart Nginx
Write-Host "`n🔄 Restarting Nginx..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "docker restart insurance-lab-nginx"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Landing: https://insurance-lab.ai" -ForegroundColor Cyan
    Write-Host "🌐 App:     https://app.insurance-lab.ai" -ForegroundColor Cyan
    Write-Host "💡 Press CTRL+SHIFT+R to hard refresh" -ForegroundColor Gray
}
else {
    Write-Host "⚠️  Nginx restart failed" -ForegroundColor Yellow
}
