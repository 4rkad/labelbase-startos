import { FileHelper } from '@start9labs/start-sdk'
import { z } from 'zod'
import { sdk } from '../sdk'

/**
 * Nginx config — serves static/media + reverse-proxies Django on 127.0.0.1:8000.
 * In StartOS all subcontainers of the same package share the loopback, so we
 * use `127.0.0.1` instead of the Umbrel `4rkad-labelbase_django_1` hostname.
 */

const DEFAULT_NGINX_CONF = `worker_processes 1;
events { worker_connections 1024; }

http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;

  upstream labelbase_django {
    server 127.0.0.1:8000;
  }

  server {
    listen 8080;
    client_max_body_size 100M;
    server_name _;
    charset utf-8;

    location /static { alias /app/static; autoindex off; }
    location /media  { alias /app/media;  autoindex off; }

    location / {
      proxy_pass http://labelbase_django;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffers 4 32k;
      proxy_buffer_size 32k;
    }
  }
}
`

export const nginxConf = FileHelper.string(
  { base: sdk.volumes.main, subpath: '/nginx.conf' },
  z.string().catch(() => DEFAULT_NGINX_CONF),
)
