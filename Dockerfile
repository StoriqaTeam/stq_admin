FROM nginx:1.15

COPY dist /app/admin
COPY nginx /etc/nginx
