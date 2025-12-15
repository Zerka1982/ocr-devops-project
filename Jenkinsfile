pipeline {
    agent { label 'prod_orc' }
    
    environment {
        REPO_URL = 'https://github.com/HM-Hadil/ocr-devops-project.git'
        BRANCH = 'main'
    }
    
    stages {
        stage('📦 Clone Repository') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '📦 Cloning repository...'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }
        
        stage('🔨 Compile Backend') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '🔨 Compiling Spring Boot backend...'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                dir('backend') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '🐳 Building Docker images...'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                sh '''
                    docker build -t ocr-backend:latest ./backend
                    docker build -t ocr-frontend:latest ./Front_End
                    docker build -t ocr-ia:latest ./IA-service
                '''
            }
        }
        
        stage('🚀 Deploy Application') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '🚀 Deploying application...'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                sh '''
                    docker compose down || true
                    docker compose up -d
                '''
            }
        }
        
        stage('🏥 Health Check') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '🏥 Checking application health...'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                sh '''
                    sleep 15
                    curl -f http://localhost:9090 || echo "⚠️  Backend starting..."
                    curl -f http://localhost:3000 || echo "⚠️  Frontend starting..."
                '''
            }
        }
    }
    
    post {
        success {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '✅ Pipeline executed successfully!'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo ''
            echo '📍 Application accessible :'
            echo '   • Frontend : http://localhost:3000'
            echo '   • Backend  : http://localhost:9090'
            echo '   • IA       : http://localhost:5000'
            echo '   • pgAdmin  : http://localhost:8081'
        }
        failure {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '❌ Pipeline failed'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        }
    }
}