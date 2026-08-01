// "id": "3959e9cf-6736-4f1e-b7fd-7abbcab0e68b",
// "org_id": "dev",
// "name": "BM25",
// "provider_type": "local",
// "provider": "qrant",
// "model_name": "Qdrant | bm25",
// "model_id": "Qdrant/bm25",
// "description": "BM25 sparse embedding model for keyword-based retrieval",
// "model_metadata": {},
// "size_in_gb": 0.01
// "created_at": "2026-05-02T09:12:18.545784Z",
// "updated_at": "2026-05-02T09:12:18.545788Z"

export enum SparseModelProviderTypeInterface {
  LOCAL = "local",
  CLOUD = "cloud",
}

export type SparseModelMetadataInterface = Record<string, unknown>;

export interface SparseTextModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider_type: SparseModelProviderTypeInterface;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  size_in_gb?: number;
  model_metadata?: SparseModelMetadataInterface;
  created_at: string;
  updated_at: string;
}

// Create

// "org_id": "dev",
// "name": "BM25",
// "provider_type": "local",
// "provider": "qrant",
// "model_name": "Qdrant | bm25",
// "model_id": "Qdrant/bm25",
// "description": "BM25 sparse embedding model for keyword-based retrieval",
// "model_metadata": {},
// "size_in_gb": 0.01

export interface CreateSparseTextModelInterface {
  org_id: string;
  name: string;
  provider_type: SparseModelProviderTypeInterface;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  size_in_gb?: number;
  model_metadata?: SparseModelMetadataInterface;
}
