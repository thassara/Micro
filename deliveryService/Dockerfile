# Use OpenJDK base image
FROM eclipse-temurin:21-jdk-alpine

# Set app directory
WORKDIR /app

# Copy built jar into image
COPY target/deliveryService-0.0.1-SNAPSHOT.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
