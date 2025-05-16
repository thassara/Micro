# Use a base image with JDK 21
FROM eclipse-temurin:21-jdk as builder

WORKDIR /app

# Copy project files and build with Maven
COPY . .
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/target/gateway-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
