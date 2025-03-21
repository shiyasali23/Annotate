# First, use nginx:alpine as the base image
FROM nginx:alpine as build

# Second, use nginx:alpine as the base image again
FROM nginx:alpine

# Ensure media folder has the correct permissions
RUN mkdir -p /usr/share/nginx/html/static/media && \
    chmod -R 755 /usr/share/nginx/html/static/media && \
    chown -R nginx:nginx /usr/share/nginx/html/static/media

# Expose ports
EXPOSE 80
EXPOSE 443

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
