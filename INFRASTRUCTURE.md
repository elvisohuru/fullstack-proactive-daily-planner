# Proactive Planner Infrastructure Overview

This document describes the cloud infrastructure architecture for the Proactive Planner application, designed for scalability, reliability, and security.

---

## 1. Environments

We operate two distinct, fully isolated environments to ensure a safe development and release lifecycle.

### a. Staging Environment
- **Purpose:** A pre-production environment that mirrors production as closely as possible. Used for final testing, QA, and integration checks before releasing to users.
- **Characteristics:**
  - Uses smaller, less expensive cloud resources (e.g., smaller database instances).
  - Contains anonymized or sample data.
  - Deployed to automatically on every merge to the `main` branch.

### b. Production Environment
- **Purpose:** The live environment used by our customers.
- **Characteristics:**
  - Uses scalable, highly-available resources.
  - Protected by stricter security rules and monitoring.
  - Deployments are triggered manually after successful verification in the staging environment.

Both environments are managed via **Terraform** using workspaces to maintain consistency.

---

## 2. Core Components (per environment)

- **VPC (Virtual Private Cloud):** A logically isolated section of the cloud for our resources.
- **Container Orchestrator (AWS ECS):** Manages running our Docker containers (API, background workers). It handles auto-scaling, health checks, and rolling deployments.
- **Database (AWS RDS for PostgreSQL):** A managed relational database service that handles backups, patching, and scaling.
- **Cache (AWS ElastiCache for Redis):** A managed in-memory data store used for caching, session storage, and as a message broker for background jobs.
- **Load Balancer (AWS ALB):** Distributes incoming API traffic across our container instances.

---

## 3. Asset Caching & Delivery (CDN)

**Goal:** To improve frontend performance and reduce load on our application server by serving static assets (JavaScript, CSS, images) from a global network of edge locations.

**Implementation:**
- **Service:** We use **Amazon CloudFront** as our Content Delivery Network (CDN).
- **Origin:** The CDN is configured to pull static assets from an **AWS S3 bucket** where the built frontend application is stored.
- **Workflow:**
  1.  During the CI/CD pipeline, the React frontend is built into static HTML, CSS, and JS files.
  2.  These files are uploaded to the S3 bucket.
  3.  The CDN caches these files at edge locations around the world.
  4.  When a user visits the application, their browser downloads these assets from the nearest edge location, resulting in significantly lower latency.
- **Cache Invalidation:** The CI/CD pipeline is responsible for creating a cache invalidation in CloudFront after a new version of the frontend is deployed to ensure users receive the latest assets.