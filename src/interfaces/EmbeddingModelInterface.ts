// {
// "org_id": "dev",
// "name": "Text Embedding 3 Small",
// "provider": "openai",
// "model_name": "text-embedding-3-small",
// "model_id": "text-embedding-3-small",
// "dimension": 1536,
// "description": "Fast and cost-efficient embedding model suitable for semantic search, clustering, and lightweight RAG.",
// "id": "3ef1a87a-1c63-490c-a744-cb0129247315",
// "created_at": "2026-05-02T10:29:28.773268Z",
// "updated_at": "2026-05-02T10:29:28.773273Z"
// }

export interface EmbeddingModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  dimension: number;
  description: string;
  created_at: string;
  updated_at: string;
}

// {
//   "org_id": "string",
//   "name": "string",
//   "provider": "openai",
//   "model_name": "string",
//   "model_id": "string",
//   "dimension": 0,
//   "description": "string"
// }

export interface CreateEmbeddingModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  dimension: number;
  description: string;
}
