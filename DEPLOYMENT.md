# 24TRADEX - Deployment Guide

This guide covers preparing and deploying the 24TRADEX platform to production.

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] Remove unnecessary files (archive, attached_assets)
- [x] Clean up debug code and console.logs
- [x] Verify all imports are used
- [x] Run TypeScript type checking: `pnpm run typecheck`
- [x] Frontend builds successfully: `pnpm run build`
- [x] Django checks pass: `python manage.py check`

### 2. Security Configuration
- [ ] Generate production SECRET_KEY (50+ characters, 5+ unique chars)
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Copy `.env.example` to `.env` and fill with production values
- [ ] Set `DEBUG = False` in settings
- [ ] Set `SECURE_SSL_REDIRECT = True`
- [ ] Set `SESSION_COOKIE_SECURE = True`
- [ ] Set `CSRF_COOKIE_SECURE = True`
- [ ] Set `SECURE_HSTS_SECONDS = 31536000`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Configure `CORS_ALLOWED_ORIGINS` with frontend URL

### 3. Database Preparation
- [ ] Run migrations on production: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Create SystemSettings instance with correct `coin_rate`
- [ ] Set up database backups (recommend PostgreSQL for production)
- [ ] Test database restoration procedure

### 4. Static Files & Media
- [ ] Run `python manage.py collectstatic --noinput`
- [ ] Configure web server to serve static files
- [ ] Set up media file storage (S3 or local)
- [ ] Verify STATIC_URL and MEDIA_URL are correct

### 5. Email Configuration
- [ ] Configure EMAIL_BACKEND (SendGrid, Gmail, etc.)
- [ ] Set EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD
- [ ] Test email notifications (purchase approval, withdrawal status)
- [ ] Configure admin email for alerts

### 6. API & Frontend Setup
- [ ] Frontend built and dist/ ready
- [ ] API endpoints tested in production environment
- [ ] CORS configured correctly
- [ ] API rate limiting configured
- [ ] Error logging set up

### 7. SSL/HTTPS
- [ ] Obtain SSL certificate (Let's Encrypt, etc.)
- [ ] Configure web server for SSL
- [ ] Test HTTPS connection
- [ ] Set up automatic renewal

### 8. Monitoring & Logging
- [ ] Configure Django logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Test alert notifications

## Deployment Steps

### Option 1: Manual Deployment (VPS/Dedicated Server)

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/24tradex.git
cd 24tradex
```

#### 2. Set Up Environment
```bash
# Copy environment file
cp backend/.env.example backend/.env
# Edit .env with production values
nano backend/.env
```

#### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install
npm run build
cd ..

# Backend
pip install -r backend/requirements.txt
```

#### 4. Prepare Database
```bash
cd backend/tradex
python manage.py migrate
python manage.py createsuperuser
# Create SystemSettings via Django shell or admin
```

#### 5. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

#### 6. Configure Web Server

**Using Gunicorn + Nginx (recommended):**

```bash
# Install Gunicorn
pip install gunicorn

# Create systemd service: /etc/systemd/system/24tradex.service
[Unit]
Description=24TRADEX Django Application
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/path/to/24tradex/backend/tradex
ExecStart=/usr/bin/gunicorn --workers 4 --bind 127.0.0.1:8000 tradex.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable 24tradex
sudo systemctl start 24tradex

# Configure Nginx: /etc/nginx/sites-available/24tradex
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static {
        alias /path/to/24tradex/backend/tradex/staticfiles;
        expires 30d;
    }

    # Media files
    location /media {
        alias /path/to/24tradex/backend/tradex/media;
        expires 7d;
    }

    # Frontend
    location / {
        root /path/to/24tradex/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/24tradex /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y nodejs npm
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build
WORKDIR /app

# Run migrations and collect static files
RUN cd backend/tradex && python manage.py collectstatic --noinput

# Start application
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:8000", "tradex.wsgi:application"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: tradex
      POSTGRES_USER: tradex
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DEBUG: "False"
      DATABASE_URL: postgresql://tradex:secure_password@db:5432/tradex
    depends_on:
      - db
    volumes:
      - ./backend/tradex/media:/app/backend/tradex/media
      - ./backend/tradex/staticfiles:/app/backend/tradex/staticfiles

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose up -d
```

### Option 3: Platform-as-a-Service (PaaS)

**Heroku:**
```bash
# Create Procfile
echo "web: gunicorn tradex.wsgi" > Procfile

# Deploy
heroku login
heroku create 24tradex
git push heroku main
heroku run "python backend/tradex/manage.py migrate"
```

**AWS Elastic Beanstalk:**
```bash
pip install awsebcli
eb init
eb create 24tradex-prod
eb deploy
```

**Railway, Render, or similar:**
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

## Post-Deployment Verification

### 1. Basic Connectivity
```bash
curl https://yourdomain.com/api/settings/public/
curl https://yourdomain.com/
```

### 2. Authentication
- Test user registration
- Test user login
- Test logout

### 3. Purchase Flow
- Create test purchase
- Verify payment storage
- Check admin approval page
- Test admin approval workflow

### 4. Withdrawal Flow
- Request withdrawal
- Verify unlocking calculation
- Test admin approval
- Verify staged payout logic

### 5. Sponsor System
- Verify sponsor code generation
- Test referral tracking
- Check sponsor earnings

### 6. Admin Panel
- Verify dashboard accessible
- Test user management
- Test purchase approvals
- Test withdrawal approvals

### 7. Notifications
- Verify email notifications send
- Check purchase approval email
- Check withdrawal status emails

## Monitoring & Maintenance

### Regular Tasks
- Monitor server logs: `journalctl -u 24tradex -f`
- Check database backups (daily)
- Monitor API response times
- Review error logs (Sentry)
- Update packages (monthly)

### Database Maintenance
- Optimize queries
- Index important columns
- Monitor storage usage
- Test backup/restore procedures

### Security Maintenance
- Keep Django/dependencies updated
- Review security headers
- Monitor failed login attempts
- Rotate API keys (quarterly)
- Audit admin access logs

## Troubleshooting

### Django Server Won't Start
```bash
# Check syntax
python manage.py check

# Check logs
journalctl -u 24tradex -n 50

# Test with runserver
python manage.py runserver
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check credentials in .env
cat backend/.env | grep DATABASE

# Test connection
psql -U tradex -h localhost -d tradex
```

### Static Files Not Loading
```bash
# Rebuild static files
python manage.py collectstatic --clear --noinput

# Check Nginx configuration
sudo nginx -t

# Check file permissions
ls -l staticfiles/
```

### High Server Load
```bash
# Check processes
top -b -n 1 | head -20

# Check database queries
# Enable slow query log in PostgreSQL settings

# Increase worker count
# Edit Gunicorn workers in systemd service
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert to previous code
git revert HEAD

# 2. Rebuild and restart
systemctl restart 24tradex

# 3. Check logs
journalctl -u 24tradex -n 100

# 4. If database is corrupted:
# - Restore from backup
# - Contact DevOps
```

## Performance Optimization

### Frontend
- Gzip enabled in Nginx
- Browser caching configured
- Code splitting for large bundles
- CDN for static assets

### Backend
- Database query optimization
- Caching strategy (Redis)
- Connection pooling
- Async tasks (Celery)

### Infrastructure
- Load balancing with multiple servers
- Auto-scaling based on traffic
- Database replication (for data safety)
- CDN for global distribution

## Scaling Considerations

When traffic increases:

1. **Database:** Migrate SQLite → PostgreSQL → Managed DB
2. **Backend:** Scale horizontally with load balancer
3. **Frontend:** Use CDN for global distribution
4. **Assets:** Store media in S3 or similar
5. **Cache:** Implement Redis for session/query caching
6. **Async:** Use Celery for background tasks

## Support & Questions

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- Gunicorn Docs: https://gunicorn.org/
- Nginx Docs: https://nginx.org/
- React Docs: https://react.dev/

