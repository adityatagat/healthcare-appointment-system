# Healthcare Appointment System

A microservices-based healthcare appointment platform connecting patients with healthcare providers, featuring secure medical record access, appointment scheduling, and billing integration.

## Features

- **Secure API Gateway** with JWT authentication and rate limiting
- **Microservices Architecture** for scalability and maintainability
- **CI/CD Pipeline** with GitHub Actions
- **Kubernetes Deployment** with blue-green deployment strategy
- **Monitoring & Logging** integration
- **Automated Testing** with code coverage

## CI/CD Pipeline

The project includes GitHub Actions workflows for:

1. **PR Checks**: Runs on pull requests to `main` and `develop` branches
   - Unit tests
   - Linting
   - Security scans
   - Code coverage reporting

2. **CI/CD Pipeline**: Runs on pushes to `main` and `develop` branches
   - Build and test
   - Docker image building and publishing
   - Deployment to staging (develop branch)
   - Blue-green deployment to production (main branch)

### Deployment Environments

- **Staging**: Automatically deployed from `develop` branch
- **Production**: Manually triggered from `main` branch with blue-green deployment

## Architecture Overview

### Core Services

1. **API Gateway**
   - Central entry point for all client requests
   - Request routing and composition
   - Authentication and authorization

2. **User Management Service**
   - Authentication & authorization
   - User profiles and roles
   - Session management

3. **Appointment Service**
   - Appointment scheduling
   - Availability management
   - Calendar integration

4. **Provider Management Service**
   - Healthcare provider profiles
   - Practice management
   - Provider search and discovery

5. **Medical Records Service**
   - Secure document storage
   - HIPAA-compliant access control
   - Audit logging

6. **Notification Service**
   - Email/SMS notifications
   - Appointment reminders
   - System alerts

7. **Billing & Insurance Service**
   - Payment processing
   - Insurance verification
   - Invoicing

8. **Analytics Service**
   - Business intelligence
   - Usage statistics
   - Custom reporting

## Technology Stack

### Backend
- **API Gateway**: Node.js with Express
- **Service Framework**: Mix of Node.js, Python (FastAPI), and Java (Spring Boot)
- **Databases**: PostgreSQL, MongoDB, Redis
- **Message Broker**: Apache Kafka
- **Containerization**: Docker
- **Orchestration**: Kubernetes

### Frontend
- **Web**: React.js with TypeScript
- **Mobile**: React Native
- **State Management**: Redux Toolkit
- **Styling**: Material-UI with Theme Provider

### DevOps
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Hosting**: Vercel (Frontend), AWS/GCP (Backend)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (LTS)
- Python 3.9+
- Java 17+
- npm or yarn

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/healthcare-appointment-system.git
   cd healthcare-appointment-system
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Access the applications:
   - Web App: http://localhost:3000
   - API Gateway: http://localhost:8000
   - Monitoring: http://localhost:9090 (Prometheus)
   - Logs: http://localhost:5601 (Kibana)

## Project Structure

```
healthcare-appointment-system/
├── api-gateway/          # API Gateway service
├── services/             # All microservices
│   ├── user-service/
│   ├── appointment-service/
│   ├── provider-service/
│   ├── medical-records-service/
│   ├── notification-service/
│   └── billing-service/
├── frontend/             # Web application
├── infra/                # Infrastructure as Code
│   ├── k8s/              # Kubernetes manifests
│   └── terraform/        # Terraform configurations
└── docs/                 # Documentation
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Write tests
4. Ensure all tests pass
5. Create a pull request
6. Get code review approval
7. Merge to `main`

## Deployment

### Staging
- Automatically deployed on push to `develop` branch
- Accessible at: https://staging.healthcare-app.example.com

### Production
- Manually deployed from `main` branch
- Accessible at: https://healthcare-app.example.com

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/your-username/healthcare-appointment-system](https://github.com/your-username/healthcare-appointment-system)
