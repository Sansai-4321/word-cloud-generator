pipeline {
    agent any

    environment {
        // Defines the image name to use across stages
        IMAGE_NAME = "word-cloud-generator"
        // In a real environment, you'd use credentials from Jenkins credential store
        // DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from GitHub (automatically uses webhook trigger configuration)
                checkout scm
                echo "Code checked out successfully."
            }
        }

        stage('Test & Lint') {
            steps {
                // In a more complex JS app, we would run npm install && npm test here
                echo "Running static analysis/tests..."
                // Simple check to ensure required files exist
                bat 'IF NOT EXIST index.html EXIT /B 1'
                bat 'IF NOT EXIST style.css EXIT /B 1'
                bat 'IF NOT EXIST script.js EXIT /B 1'
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker Image..."
                // Build the image using the Dockerfile in the current directory
                bat "docker build -t ${IMAGE_NAME}:${env.BUILD_ID} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Docker Push') {
            steps {
                echo "Pushing Docker Image to Registry..."
                // Here you would authenticate to Docker Hub or GHCR and push the image
                // Example:
                // sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                // sh "docker push ${IMAGE_NAME}:${env.BUILD_ID}"
                // sh "docker push ${IMAGE_NAME}:latest"
                echo "(Simulated) Pushed image to registry."
            }
        }
        
        stage('Deploy') {
            steps {
                echo "Deploying application..."
                // Run the container on the target server or apply Kubernetes manifests
                // sh "docker run -d -p 8080:80 --name word-cloud-${env.BUILD_ID} ${IMAGE_NAME}:latest"
                echo "(Simulated) Application deployed to production/staging environment."
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded! Application is built and ready."
        }
        failure {
            echo "Pipeline failed. Please check the logs."
        }
    }
}
