# CI/CD Pipeline for Proactive Planner

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Proactive Planner application, using GitHub Actions.

## Goals
- **Automate Testing:** Automatically run linting, unit, and integration tests on every push and pull request.
- **Automate Builds:** Create a production-ready Docker image for the backend.
- **Automate Deployments:** Deploy seamlessly to Staging and Production environments with manual approval for production.
- **Ensure Code Quality:** Enforce code style and quality checks.

---

## Workflow Trigger

The pipeline is triggered on:
1.  **Push** to the `main` branch.
2.  **Push** to any feature branch (`feature/*`).
3.  **Pull Request** targeting the `main` branch.

---

## Pipeline Stages

### 1. Lint & Test (Run on all triggers)

- **Job Name:** `lint-and-test`
- **Runner:** `ubuntu-latest`
- **Steps:**
  1.  **Checkout Code:** Check out the repository.
  2.  **Setup Node.js:** Install the correct Node.js version.
  3.  **Install Dependencies:** Run `npm install` for both frontend and backend.
  4.  **Lint Check:** Run `npm run lint` to check for code style issues.
  5.  **Unit & Integration Tests:** Run `npm run test` for the backend to execute unit and integration tests against a test database.

### 2. Build Docker Image (Run on push to `main`)

- **Job Name:** `build-and-push-docker`
- **Needs:** `lint-and-test` (runs only if tests pass)
- **Runner:** `ubuntu-latest`
- **Steps:**
  1.  **Checkout Code:** Check out the repository.
  2.  **Login to AWS ECR:** Authenticate with the Amazon Elastic Container Registry.
  3.  **Build Docker Image:** Build the backend Docker image using the `Dockerfile`.
  4.  **Tag Image:** Tag the image with the Git commit SHA and `latest`.
  5.  **Push Image to ECR:** Push the tagged image to the ECR repository.

### 3. Deploy to Staging (Run on push to `main`)

- **Job Name:** `deploy-staging`
- **Needs:** `build-and-push-docker`
- **Environment:** `staging`
- **Runner:** `ubuntu-latest`
- **Steps:**
  1.  **Checkout Code:** Check out the repository.
  2.  **Configure AWS Credentials:** Set up credentials for the staging AWS account.
  3.  **Run Database Migrations:** Securely run `npx prisma migrate deploy` against the staging database.
  4.  **Deploy to ECS:** Update the AWS ECS service to use the new Docker image tag, triggering a rolling deployment.

### 4. Deploy to Production (Manual trigger after Staging deployment)

- **Job Name:** `deploy-production`
- **Needs:** `deploy-staging`
- **Environment:** `production`
- **Environment Protection Rules:** Requires manual approval from a designated "Deployer" team/person.
- **Runner:** `ubuntu-latest`
- **Steps:**
  1.  **Checkout Code:** Check out the repository.
  2.  **Configure AWS Credentials:** Set up credentials for the production AWS account.
  3.  **Run Database Migrations:** Securely run `npx prisma migrate deploy` against the production database.
  4.  **Deploy to ECS:** Update the production AWS ECS service with the new Docker image tag.

---

## Secrets Management
- All sensitive information (AWS keys, database passwords) are stored as encrypted **GitHub Actions Secrets**.
- Different secrets are scoped to different environments (`staging`, `production`).