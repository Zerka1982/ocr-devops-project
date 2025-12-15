# Étape 1 : Build avec Maven et Java 21
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier pom.xml et télécharger les dépendances
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copier le code source
COPY src ./src

# Compiler l'application
RUN ./mvnw clean package -DskipTests

# Étape 2 : Image d'exécution avec Java 21
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/ocr-backend.jar app.jar

# Créer le répertoire uploads
RUN mkdir -p /tmp/uploads

# Exposer le port
EXPOSE 8080

# Variables d'environnement
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mydb
ENV SPRING_DATASOURCE_USERNAME=admin
ENV SPRING_DATASOURCE_PASSWORD=admin

# Démarrer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]