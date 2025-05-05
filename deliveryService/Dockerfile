# Use a base image with JDK 21
FROM eclipse-temurin:21-jdk

# Set the working directory
WORKDIR /app

# Copy the jar file into the container
COPY target/*.jar app.jar

# Expose the port your service runs on (e.g., 8082 for Delivery)
EXPOSE 8082

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
