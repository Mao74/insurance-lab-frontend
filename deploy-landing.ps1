# Insurance Lab - Landing Page Only Deployment
# Usage: .\deploy-landing.ps1

Write-Host "🚀 Deploying Insurance Lab Landing Page..." -ForegroundColor Cyan

$VPS_IP = "46.224.127.115"
$VPS_USER = "root"
$VPS_PATH = "/root/insurance-lab-deploy/landing"
$LOCAL_HTML = "public/insurance-lab.ai.html"

# Check if file exists
if (-Not (Test-Path $LOCAL_HTML)) {
    Write-Host "❌ Error: $LOCAL_HTML not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the insurance-lab-frontend directory" -ForegroundColor Yellow
    exit 1
}

# Upload landing page
Write-Host "📤 Uploading landing page..." -ForegroundColor Yellow
scp $LOCAL_HTML "${VPS_USER}@${VPS_IP}:${VPS_PATH}/index.html"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

# Upload logo
Write-Host "📤 Uploading logo..." -ForegroundColor Yellow
scp public/logo-horizontal.png "${VPS_USER}@${VPS_IP}:${VPS_PATH}/logo-horizontal.png"

# Restart Nginx
Write-Host "🔄 Restarting Nginx..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "docker restart insurance-lab-nginx"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nginx restart failed, but file uploaded successfully" -ForegroundColor Yellow
}
else {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Visit: https://insurance-lab.ai" -ForegroundColor Cyan
    Write-Host "💡 Press CTRL+SHIFT+R to hard refresh" -ForegroundColor Gray
}
