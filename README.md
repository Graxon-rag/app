# Graxon App

> **First Open-Source Hybrid RAG to eliminate hallucinations through a persistent Knowledge Graph layer.**

Graxon combines dense vector search, sparse retrieval, and a structured Knowledge Graph to deliver accurate, traceable, and context-aware answers — at scale, across multiple organizations, projects, and documents.

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

---

## Multipart Upload & Resume

Graxon's zero-loss checkpointing extends all the way to the browser.

Most upload implementations are fire-and-forget — if the connection drops at 95%, you start over. Graxon's upload system is session-aware and part-level resumable on both the frontend and backend, mirroring the same checkpoint philosophy as the ingestion pipeline.

- bucket: {org_id}
- key: pro*{project_id}/doc*{document_id}/{filename}

Each organization gets its own bucket. Each document gets its own isolated path within the project scope.

---

### Upload Flow

```
Browser
│
├── 1. Check local session (documentId, uploadId, key, completedParts)
│
├── 2. POST /multipart/init  (if no session)
│         └── Backend: auto-creates org bucket if missing
│                       creates S3 multipart upload
│                       returns uploadId + key
│                       session persisted on frontend
│
├── 3. For each part:
│         ├── Skip if already in completedParts  ──► advance progress
│         ├── GET presigned URL from backend (1hr expiry)
│         └── PUT chunk directly to MinIO  (no data through app server)
│
├── 4. POST /multipart/complete
│         └── Backend: sorts parts by PartNumber (S3 requirement)
│                       calls S3 complete_multipart_upload
│                       registers document via DocumentService
│                       triggers ingestion pipeline
│
└── 5. Session deleted on success  /  preserved on failure for retry
```

---

### Backend: `MinioUploadClient`

**`multipart_upload_init`**
Ensures the org bucket exists (creates it if not), registers a new multipart upload with MinIO, and returns the `upload_id` and `key` to the frontend.

**`get_multipart_presigned_url`**
Generates a presigned `upload_part` URL per part with a 1-hour expiry. The browser uploads directly to MinIO — no file data passes through the application server.

**`complete_multipart_upload`**
Sorts completed parts by `PartNumber` (required by S3/MinIO), finalizes the multipart upload.

---

### Frontend: Session-Aware Resume

**Session Persistence**
Before every upload, the frontend checks for an existing session — `documentId`, `uploadId`, `key`, and all `completedParts`. If a previous attempt was interrupted, the session is still there.

**Part-Level Resume**
The file is split into fixed-size chunks. For each part, the frontend checks whether it was already uploaded. If so, it skips it and advances the progress bar. Only missing parts are re-uploaded.

**Local Part Tracking**
Completed parts are tracked in a local array during the session to avoid stale store reads. Parts are also persisted to the store for cross-session recovery.

---

### Failure & Retry Behavior

| Scenario                      | Behavior                                                            |
| ----------------------------- | ------------------------------------------------------------------- |
| Connection drops mid-upload   | Session preserved, retry resumes from last completed part           |
| Browser tab closed            | Session persisted, upload resumes on next open                      |
| Part upload fails             | Error surfaced, session intact, retry skips completed parts         |
| Upload completes successfully | Session deleted, document handed to `DocumentService` for ingestion |
