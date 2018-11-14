FROM nginx:1.15

COPY dist /app/storiqatools
COPY nginx /etc/nginx
