# Frontend Deployment Workflow

## Quick Deploy (Frontend App - app.insurance-lab.ai)

```bash
cd /root/insurance-lab-deploy/frontend && git pull
cd /root/insurance-lab-deploy
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d frontend
```

## Landing Page Deploy (insurance-lab.ai)

La landing page è servita da una directory separata:

```bash
# Prima pull le ultime modifiche
cd /root/insurance-lab-deploy/frontend && git pull

# Copia il file aggiornato alla directory landing
cp /root/insurance-lab-deploy/frontend/public/insurance-lab.ai.html /root/insurance-lab-deploy/landing/index.html
```

> **Nota**: Il file viene servito immediatamente (no rebuild richiesto)

## Backend Deploy

```bash
cd /root/insurance-lab-deploy/backend && git pull
cd /root/insurance-lab-deploy
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend
```

## Full Stack Deploy

```bash
cd /root/insurance-lab-deploy
cd backend && git pull && cd ..
cd frontend && git pull && cd ..
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Troubleshooting

### Cache browser
Dopo il deploy, se le modifiche non appaiono:
- Hard refresh: `Ctrl+Shift+R`
- Oppure apri in finestra incognito

### Verifica container
```bash
docker ps
docker logs insurance-lab-frontend --tail 20
docker logs insurance-lab-backend --tail 20
```

### Verifica git è aggiornato
```bash
cd /root/insurance-lab-deploy/frontend && git log --oneline -1
cd /root/insurance-lab-deploy/backend && git log --oneline -1
```
