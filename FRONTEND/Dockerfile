# Step 1: Build the application
FROM node:18 as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Remove default Nginx config and add our own if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
