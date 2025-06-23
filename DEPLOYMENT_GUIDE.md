# GPS Attendance System - Deployment Guide

This guide provides step-by-step instructions for deploying the GPS-Based Class Attendance and Student Feedback Review System to various production environments.

## 📋 Pre-Deployment Checklist

- [ ] Test the application locally
- [ ] Configure environment variables
- [ ] Set up production database
- [ ] Configure CORS settings
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Test API endpoints
- [ ] Verify GPS functionality

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Prepare the React app for production:**
   ```bash
   cd gps-attendance-system
   pnpm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Configure environment variables in Vercel dashboard:**
   - `REACT_APP_API_URL`: Your backend API URL

### Option 2: Netlify

1. **Build the application:**
   ```bash
   cd gps-attendance-system
   pnpm run build
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configure environment variables in Netlify dashboard:**
   - `REACT_APP_API_URL`: Your backend API URL

### Option 3: AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   cd gps-attendance-system
   pnpm run build
   ```

2. **Create S3 bucket and configure for static hosting**

3. **Upload build files to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront distribution**

5. **Set up custom domain and SSL certificate**

## 🖥️ Backend Deployment

### Option 1: Heroku (Recommended for beginners)

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Add Python buildpack:**
   ```bash
   heroku buildpacks:set heroku/python
   ```

3. **Create Procfile in the backend directory:**
   ```
   web: python src/main.py
   ```

4. **Configure environment variables:**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set DATABASE_URL=your-database-url
   ```

5. **Deploy to Heroku:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: DigitalOcean Droplet

1. **Create a new droplet with Ubuntu 22.04**

2. **Connect to your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Update system packages:**
   ```bash
   apt update && apt upgrade -y
   ```

4. **Install Python and required packages:**
   ```bash
   apt install python3 python3-pip python3-venv nginx -y
   ```

5. **Clone your repository:**
   ```bash
   git clone https://github.com/your-username/gps-attendance-system.git
   cd gps-attendance-system/gps-attendance-api
   ```

6. **Set up virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

7. **Configure Gunicorn:**
   ```bash
   pip install gunicorn
   ```

8. **Create systemd service file:**
   ```bash
   sudo nano /etc/systemd/system/gps-attendance.service
   ```

   Add the following content:
   ```ini
   [Unit]
   Description=GPS Attendance Flask App
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/gps-attendance-api
   Environment="PATH=/path/to/gps-attendance-api/venv/bin"
   ExecStart=/path/to/gps-attendance-api/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 src.main:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

9. **Start and enable the service:**
   ```bash
   sudo systemctl start gps-attendance
   sudo systemctl enable gps-attendance
   ```

10. **Configure Nginx:**
    ```bash
    sudo nano /etc/nginx/sites-available/gps-attendance
    ```

    Add the following configuration:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://127.0.0.1:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

11. **Enable the site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/gps-attendance /etc/nginx/sites-enabled
    sudo systemctl restart nginx
    ```

### Option 3: AWS EC2

1. **Launch EC2 instance with Ubuntu 22.04**

2. **Configure security groups:**
   - HTTP (80)
   - HTTPS (443)
   - SSH (22)
   - Custom TCP (5000) for API

3. **Follow similar steps as DigitalOcean deployment**

4. **Configure Application Load Balancer for high availability**

5. **Set up Auto Scaling Group for scalability**

## 🗄️ Database Configuration

### SQLite (Development/Small Scale)
- Default configuration works out of the box
- Suitable for development and small deployments
- File-based database included in the repository

### PostgreSQL (Production Recommended)

1. **Install PostgreSQL:**
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create database and user:**
   ```sql
   sudo -u postgres psql
   CREATE DATABASE gps_attendance;
   CREATE USER gps_user WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE gps_attendance TO gps_user;
   ```

3. **Update Flask configuration:**
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://gps_user:your-password@localhost/gps_attendance'
   ```

4. **Install PostgreSQL adapter:**
   ```bash
   pip install psycopg2-binary
   ```

### MySQL

1. **Install MySQL:**
   ```bash
   sudo apt install mysql-server
   ```

2. **Create database and user:**
   ```sql
   mysql -u root -p
   CREATE DATABASE gps_attendance;
   CREATE USER 'gps_user'@'localhost' IDENTIFIED BY 'your-password';
   GRANT ALL PRIVILEGES ON gps_attendance.* TO 'gps_user'@'localhost';
   ```

3. **Update Flask configuration:**
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://gps_user:your-password@localhost/gps_attendance'
   ```

4. **Install MySQL adapter:**
   ```bash
   pip install PyMySQL
   ```

## 🔒 SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal setup:**
   ```bash
   sudo crontab -e
   ```
   Add: `0 12 * * * /usr/bin/certbot renew --quiet`

### Using Cloudflare (Recommended)

1. **Add your domain to Cloudflare**
2. **Enable SSL/TLS encryption**
3. **Configure DNS records**
4. **Enable security features**

## 🔧 Environment Variables

### Backend (.env file)
```env
# Flask Configuration
SECRET_KEY=your-very-secret-key-here
DEBUG=False
FLASK_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost/gps_attendance

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION_HOURS=24

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.com

# Email Configuration (if needed)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Frontend (.env file)
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api

# Google Maps API (if using maps)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
NODE_ENV=production
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GPS Attendance System

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd gps-attendance-system
        npm install
        
    - name: Build application
      run: |
        cd gps-attendance-system
        npm run build
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./gps-attendance-system

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
        appdir: "gps-attendance-api"
```

## 📊 Monitoring and Logging

### Application Monitoring

1. **Set up application logging:**
   ```python
   import logging
   logging.basicConfig(level=logging.INFO)
   ```

2. **Use monitoring services:**
   - Sentry for error tracking
   - New Relic for performance monitoring
   - DataDog for comprehensive monitoring

### Server Monitoring

1. **Install monitoring tools:**
   ```bash
   sudo apt install htop iotop nethogs
   ```

2. **Set up log rotation:**
   ```bash
   sudo nano /etc/logrotate.d/gps-attendance
   ```

## 🚀 Performance Optimization

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images and assets
- Use service workers for caching

### Backend Optimization
- Implement database connection pooling
- Add Redis for caching
- Use database indexing
- Implement rate limiting
- Optimize SQL queries

### Database Optimization
- Create proper indexes
- Implement query optimization
- Set up read replicas
- Use connection pooling
- Regular maintenance tasks

## 🔧 Troubleshooting

### Common Deployment Issues

1. **CORS Errors:**
   - Verify CORS_ORIGINS configuration
   - Check frontend API URL configuration

2. **Database Connection Issues:**
   - Verify database credentials
   - Check network connectivity
   - Ensure database server is running

3. **SSL Certificate Issues:**
   - Verify domain DNS configuration
   - Check certificate expiration
   - Ensure proper Nginx configuration

4. **Performance Issues:**
   - Monitor server resources
   - Check database query performance
   - Implement caching strategies

### Health Checks

1. **API Health Check:**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Database Connection Check:**
   ```bash
   curl https://your-api-domain.com/api/users
   ```

3. **Frontend Accessibility:**
   ```bash
   curl https://your-frontend-domain.com
   ```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement auto-scaling
- Use container orchestration (Kubernetes)
- Implement microservices architecture

### Vertical Scaling
- Increase server resources
- Optimize application performance
- Use better database configurations
- Implement caching strategies

## 🔐 Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Strong JWT secrets
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Regular security updates
- [ ] Backup strategy implemented

## 📞 Support

For deployment support:
- Check the main README.md file
- Review error logs carefully
- Test each component individually
- Verify all environment variables
- Check network connectivity

---

**Happy Deploying! 🚀**

