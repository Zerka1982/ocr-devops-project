# ========= BUILD STAGE =========
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven config first (for cache)
COPY pom.xml .
COPY .mvn .mvn

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests


# ========= RUNTIME STAGE =========
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/ocr-backend.jar app.jar

# Create uploads directory
RUN mkdir -p /tmp/uploads

# Expose port
EXPOSE 8080

# Environment variables
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mydb
ENV SPRING_DATASOURCE_USERNAME=admin
ENV SPRING_DATASOURCE_PASSWORD=admin

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]
