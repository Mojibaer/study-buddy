# StudyBuddy Backend - Production Deployment

## Overview

The backend runs as a systemd service with Gunicorn + Uvicorn Workers on port 8001.

## Service Management

```bash
# Check status
sudo systemctl status studybuddy-backend

# Start
sudo systemctl start studybuddy-backend

# Stop
sudo systemctl stop studybuddy-backend

# Restart
sudo systemctl restart studybuddy-backend

# Enable autostart on boot (already enabled)
sudo systemctl enable studybuddy-backend

# Disable autostart
sudo systemctl disable studybuddy-backend
```

## Logs

```bash
# Live logs (follow mode)
sudo journalctl -u studybuddy-backend -f

# Last 100 lines
sudo journalctl -u studybuddy-backend -n 100

# Logs since today
sudo journalctl -u studybuddy-backend --since today

# Logs from last hour
sudo journalctl -u studybuddy-backend --since "1 hour ago"
```

## Health Check

```bash
curl http://localhost:8001/health
```

## Configuration

Service file: `/etc/systemd/system/studybuddy-backend.service`

```ini
[Unit]
Description=StudyBuddy Backend
After=network.target

[Service]
User=studybuddy
WorkingDirectory=/home/studybuddy/study-buddy/backend
EnvironmentFile=/home/studybuddy/study-buddy/backend/.env
Environment="PATH=/home/studybuddy/study-buddy/backend/venv/bin"
ExecStart=/home/studybuddy/study-buddy/backend/venv/bin/gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
Restart=always

[Install]
WantedBy=multi-user.target
```

After modifying the service file:

```bash
sudo systemctl daemon-reload
sudo systemctl restart studybuddy-backend
```

## Environment Variables

Defined in `/home/studybuddy/study-buddy/backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/studybuddy
CHROMA_HOST=localhost
CHROMA_PORT=8100
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
```

## Troubleshooting

**Service won't start:**
```bash
# Detailed error message
sudo journalctl -u studybuddy-backend -n 50 --no-pager
```

**Port already in use:**
```bash
sudo lsof -i :8001
```

**Manual testing (without systemd):**
```bash
cd /home/studybuddy/study-buddy/backend
source venv/bin/activate
make run-prod
```