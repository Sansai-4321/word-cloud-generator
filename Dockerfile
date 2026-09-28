# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the static HTML, CSS, and JS files to Nginx's default public directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
