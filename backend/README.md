# 🚀 OCR DevOps Project

Plateforme d'extraction de données par OCR avec architecture conteneurisée.

## 🏗️ Architecture

- **Backend** : Spring Boot (Java 21) - API REST
- **Frontend** : React - Interface utilisateur
- **OCR Service** : Python (Flask) - Extraction de texte
- **Database** : PostgreSQL 16
- **Container** : Docker & Docker Compose
- **CI/CD** : GitHub Actions + Jenkins
- **Infrastructure** : Vagrant + Ansible
- **Monitoring** : Nagios

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop installé
- Git installé

### Installation

1. Cloner le repository :
```bash
git clone https://github.com/HM-Hadil/ocr-devops-project.git
cd ocr-devops-project
```

2. Lancer l'application :
```bash
docker-compose up -d
```

3. Accéder aux services :

- Backend : http://localhost:9090
- pgAdmin : http://localhost:8081

## 📚 Documentation

- [Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Guide de Contribution](CONTRIBUTING.md)

## 👥 Équipe

- Backend : @HM-Hadil
- Frontend : [Khouloud GHABI](https://github.com/Khouloud-ghabi)
- OCR Service : [Melek HADDAR ](https://github.com/HaddarMelek)

## 📄 Licence

MIT License - voir [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 | docker login ghcr.io -u HM-Hadil --password-stdin](LICENSE)
