<h2>
 <img
  width="180"
  alt="Homer's donut"
  src="https://raw.githubusercontent.com//bastienwirtz/homer/main/public/logo.png">
    <br/>
    It's a fork of Homer Dashboard with some changes:
    <br/>
    - Added services: Tailscale, Transmission, Nextcloud, Cloudflare
    <br/>
    - Added nginx reverse proxy to deal with CORS issues 
</h2>

### Sample nginx config
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
    }

}
```

### Installation witch docker-compose
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

### Build manually

```bash
# Using yarn
yarn install
yarn build
# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
