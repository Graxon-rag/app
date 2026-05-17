# Graxon App

**First Open-Source Hybrid RAG to eliminate hallucinations through a persistent Knowledge Graph layer.**

Welcome to the Graxon Frontend application.

Depending on your workflow, you can choose to run this application locally, via a Dockerized development container, or in a production-ready Docker environment.

---

## 🛠️ Prerequisites & Setup

Before running the application in any mode, you must create your local environment configuration file:

```bash
# Copy the template environment file
cp .env.example .env
```

## 🚀 Execution Choices

Choose one of the three methods below to spin up the application:

### Choice 1: Local Development (Native Bun)

Best if you prefer to run the app directly on your host machine without containerization.

```bash
# 1. Install dependencies
bun i

# 2. Run the local development server
bun run dev
```

The app will typically be accessible at http://localhost:5995 (or the port specified in your terminal).

### Choice 2: Docker Development (With Container HMR)

Best for keeping your host machine clean while maintaining instant hot-reloading (Hot Module Replacement) as you change your code.

```bash
docker compose -f docker-compose-dev.yml up --build
```

The application will be accessible at http://localhost:5995

#### To view live container logs:

```bash
docker compose -f docker-compose-dev.yml logs -f
```

### Choice 3: Docker Production

Best for staging, testing final distribution builds, or deploying to a server. This builds the production distribution folder and serves it securely over an Alpine-Nginx runtime.

```bash
# Spin up the compiled multi-stage production environment
docker compose up -d --build
```

The application will be accessible at http://localhost:5995

## 🛑 Stopping Containers

If you are running either of the Docker variations, you can spin down the environments using:

- ### For Development:

```bash
docker compose -f docker-compose-dev.yml down
```

- ### For Production:

```bash
docker compose down
```
