<div align="center">
  <h1>Homer Dashboard</h1>
  <img src="https://raw.githubusercontent.com/bastienwirtz/homer/main/public/logo.png" alt="Homer's Donut" width="180" height="180">
</div>

This repository is a fork of the Homer Dashboard with several enhancements and added services.

## Changes Made

We've made the following changes to the original Homer Dashboard:

- Added services:
    - Tailscale
    - Transmission
    - Nextcloud
    - Cloudflare
    - Proxmox Backup

- Implemented an nginx reverse proxy to address CORS (Cross-Origin Resource Sharing) issues.

### Sample Nginx Configuration

Here's a sample Nginx configuration to help you get started:

```nginx
events {
    worker_connections  1024;
}

http {
    server {
        listen 80 default_server;

        location / {
            proxy_pass http://homer:8060; # container name
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /cf {
            resolver 1.1.1.1 valid=300s;
            set $cf_api api.cloudflare.com;
            proxy_ssl_protocols TLSv1.2;
            proxy_ssl_server_name on;

            rewrite ^/cf/(.*) /$1 break;
            proxy_pass https://$cf_api:443;
            proxy_set_header Host api.cloudflare.com;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /nc {
            rewrite ^/nc/(.*) /$1 break;
            proxy_pass https://nc:4433; # update to your nextcloud host
            proxy_set_header Host nextcloud.yourdomain.home; # update to your nextcloud domain
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /ts {
            resolver 1.1.1.1 valid=300s;
            set $ts_api api.tailscale.com;
            proxy_ssl_protocols TLSv1.2;
            proxy_ssl_server_name on;

            rewrite ^/ts/(.*) /$1 break;
            proxy_pass https://$ts_api:443;
            proxy_set_header Host api.tailscale.com;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /px {
            rewrite ^/px/(.*) /$1 break;
            proxy_pass https://px:8006; # update to your proxmox host
            proxy_set_header Host proxmox.mydomain.home; # update to your proxmox domain
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        location /pxbck {
            rewrite ^/pxbck/(.*) /$1 break;
            proxy_pass https://proxmox-backup:8007; # update to your proxmox backup host
            proxy_set_header Host pxbckp.mydomain.home;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /ppngx {
            rewrite ^/ppngx/(.*) /$1 break;
            proxy_pass http://paperless-ngx:4050; # update to your paperless-ngx host
            proxy_set_header Host paperless.mydomain.home;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }

}
```

### Installation with Docker Compose
To set up the Homer Dashboard and its dependencies using Docker Compose, use the following docker-compose.yml file:
```yaml
services:
  nginx:
    container_name: nginx
    image: nginx:latest
    restart: unless-stopped
    stop_grace_period: 8s
    ports:
    - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    
  homer:
    container_name: homer
    build: ./homer
    restart: unless-stopped

```

### Manual Build
If you prefer to build the dashboard manually, follow these steps:

```bash
# Using yarn
yarn install
yarn build
# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
