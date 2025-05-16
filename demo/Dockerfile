# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:21-jre-jammy

# Add a volume pointing to /tmp (helps Spring Boot temp files)
VOLUME /tmp

# Copy the jar built by Maven (adjust name if different)
ARG JAR_FILE=target/Auth-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# Expose the port your app runs on (default Spring Boot: 8080)
EXPOSE 8081

# Run the jar file
ENTRYPOINT ["java","-jar","/app.jar"]
