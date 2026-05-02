// "id": "3959e9cf-6736-4f1e-b7fd-7abbcab0e68b",
// "org_id": "dev",
// "name": "BM25",
// "provider": "Qdrant",
// "model": "Qdrant/bm25",
// "description": "BM25 sparse embedding model for keyword-based retrieval",
// "size_in_gb": 0.01,
// "created_at": "2026-05-02T09:12:18.545784Z",
// "updated_at": "2026-05-02T09:12:18.545788Z"

export interface SparseTextModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  size_in_gb: number;
  created_at: string;
  updated_at: string;
}

// Create

//   "org_id": "string",
//   "name": "string",
//   "provider": "string",
//   "model": "string",
//   "description": "string",
//   "size_in_gb": 0

export interface CreateSparseTextModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  size_in_gb: number;
}
