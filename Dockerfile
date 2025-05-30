# Nginx para servir la carpeta /site
FROM nginx:alpine
COPY site /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
