# Insurance Lab - Production Deployment Script (NUOVO)
# Usage: .\deploy-production.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " INSURANCE LAB - DEPLOYMENT COMPLETO " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$VPS_IP = "46.224.127.115"
$VPS_USER = "root"
$DEPLOY_DIR = "/root/insurance-lab-deploy"

# Step 1: Build React App
Write-Host "`n[1/6] Building React app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completata" -ForegroundColor Green

# Step 2: Upload Landing Page
Write-Host "`n[2/6] Uploading landing page..." -ForegroundColor Yellow
scp public/insurance-lab.ai.html "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/index.html"
scp public/logo-horizontal.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-1.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-2.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-3.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-4.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-5.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/screen-6.png "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/privacy-policy.html "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"
scp public/terms-of-service.html "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/landing/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Landing page caricata" -ForegroundColor Green
} else {
    Write-Host "⚠️  Errore upload landing page" -ForegroundColor Yellow
}

# Step 3: Create app directory on VPS and upload React build
Write-Host "`n[3/6] Creating app directory and uploading React build..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${DEPLOY_DIR}/app"
scp -r dist/* "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/app/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ React app caricata in /app" -ForegroundColor Green
} else {
    Write-Host "❌ Errore upload React app" -ForegroundColor Red
    exit 1
}

# Step 4: Upload NEW Nginx configuration
Write-Host "`n[4/6] Uploading NEW Nginx configuration..." -ForegroundColor Yellow
scp ../nginx-configs/app.conf.new "${VPS_USER}@${VPS_IP}:${DEPLOY_DIR}/nginx/conf.d/app.conf"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nginx config aggiornata" -ForegroundColor Green
} else {
    Write-Host "❌ Errore upload Nginx config" -ForegroundColor Red
    exit 1
}

# Step 5: Restart Nginx container to apply changes
Write-Host "`n[5/6] Restarting Nginx container to apply changes..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "cd ${DEPLOY_DIR} && docker compose -f docker-compose.prod.yml restart nginx"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nginx riavviato con successo" -ForegroundColor Green
} else {
    Write-Host "❌ Errore riavvio Nginx" -ForegroundColor Red
    Write-Host "Verifica logs con: ssh root@46.224.127.115" -ForegroundColor Yellow
    exit 1
}

# Step 6: Verification
Write-Host "`n[6/6] Verifying deployment..." -ForegroundColor Yellow
$verifyCommand = @"
echo '=== Nginx container status ===' && docker ps | grep nginx && echo '' && echo '=== Backend container status ===' && docker ps | grep backend && echo '' && echo '=== App files deployed ===' && docker exec insurance-lab-nginx ls -lh /usr/share/nginx/html/app/ | head -10
"@

ssh "${VPS_USER}@${VPS_IP}" $verifyCommand

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETATO CON SUCCESSO!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Landing:  https://insurance-lab.ai" -ForegroundColor Cyan
Write-Host "🌐 App:      https://app.insurance-lab.ai" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   1. Fai HARD REFRESH (Ctrl+Shift+R) nel browser" -ForegroundColor White
Write-Host "   2. Oppure apri in finestra incognito" -ForegroundColor White
Write-Host ""
Write-Host "Comandi utili per troubleshooting" -ForegroundColor Gray
Write-Host "  ssh root@46.224.127.115" -ForegroundColor Gray
Write-Host "  docker logs insurance-lab-backend --tail 50" -ForegroundColor Gray
Write-Host "  docker logs insurance-lab-nginx --tail 50" -ForegroundColor Gray
Write-Host "  docker restart insurance-lab-backend" -ForegroundColor Gray
Write-Host ""
