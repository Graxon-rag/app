import { ModelCredentialInterface } from "@/interfaces/ModelCredentialInterface";
import { EmbeddingModelInterface } from "@/interfaces/EmbeddingModelInterface";
import { SparseTextModelInterface } from "@/interfaces/SparseTextModelInterface";
import { ReRankerModelInterface } from "@/interfaces/ReRankerModelInterface";
import { LLMModelInterface } from "@/interfaces/LLMModelInterface";

// {
// "id": "3dfc7a4a-928d-424e-9138-3d5d25179a9f",
// "readable_id": "test_dt27",
// "org_id": "dev",
// "name": "Test",
// "description": "Test",
// "llm_model_id": "daf844e6-e801-46d2-9244-b34d437188a6",
// "embedding_model_id": "3ef1a87a-1c63-490c-a744-cb0129247315",
// "sparse_text_model_id": "3959e9cf-6736-4f1e-b7fd-7abbcab0e68b",
// "reranker_model_id": "903e8428-066f-4b02-bf7e-e23d817f8cf9",
// "llm_model_credential_id": "3dffd766-7084-4424-a3fd-d3af9718f401",
// "embedding_model_credential_id": "87f79bd4-248b-4167-9241-09d79c6fa275",
// "created_at": "2026-05-03T05:26:44.174085Z",
// "updated_at": "2026-05-03T05:26:44.174090Z"
// }

export interface ProjectInterface {
  id: string;
  readable_id: string;
  org_id: string;
  name: string;
  description: string;
  llm_model_id: string;
  embedding_model_id: string;
  sparse_text_model_id: string;
  reranker_model_id: string;
  llm_model_credential_id: string;
  embedding_model_credential_id: string;
  created_at: string;
  updated_at: string;
}

// {
//   "org_id": "string",
//   "name": "string",
//   "description": "string",
//   "llm_model_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "embedding_model_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "sparse_text_model_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "reranker_model_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "llm_model_credential_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "embedding_model_credential_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
// }

export interface CreateProjectInterface {
  org_id: string;
  name: string;
  description: string;
  llm_model_id: string;
  embedding_model_id: string;
  sparse_text_model_id: string;
  reranker_model_id: string;
  llm_model_credential_id: string;
  embedding_model_credential_id: string;
}

// {
// "id": "3dfc7a4a-928d-424e-9138-3d5d25179a9f",
// "readable_id": "test_dt27",
// "org_id": "dev",
// "name": "Test",
// "description": "Test",
// "details": {
//   "llm_model": {
//     "id": "daf844e6-e801-46d2-9244-b34d437188a6",
//     "org_id": "dev",
//     "name": "GPT-5.5",
//     "provider": "openai",
//     "model_name": "GPT-5.5",
//     "model_id": "gpt-5.5",
//     "description": "A new class of intelligence for coding and professional work.",
//     "created_at": "2026-05-02T09:45:05.446247Z",
//     "updated_at": "2026-05-02T09:45:05.446251Z"
//   },
//   "embedding_model": {
//     "org_id": "dev",
//     "name": "Text Embedding 3 Small",
//     "provider": "openai",
//     "model_name": "text-embedding-3-small",
//     "model_id": "text-embedding-3-small",
//     "dimension": 1536,
//     "description": "Fast and cost-efficient embedding model suitable for semantic search, clustering, and lightweight RAG.",
//     "id": "3ef1a87a-1c63-490c-a744-cb0129247315",
//     "created_at": "2026-05-02T10:29:28.773268Z",
//     "updated_at": "2026-05-02T10:29:28.773273Z"
//   },
//   "sparse_text_model": {
//     "id": "3959e9cf-6736-4f1e-b7fd-7abbcab0e68b",
//     "org_id": "dev",
//     "name": "BM25",
//     "provider": "Qdrant",
//     "model": "Qdrant/bm25",
//     "description": "BM25 sparse embedding model for keyword-based retrieval",
//     "size_in_gb": 0.01,
//     "created_at": "2026-05-02T09:12:18.545784Z",
//     "updated_at": "2026-05-02T09:12:18.545788Z"
//   },
//   "reranker": {
//     "id": "903e8428-066f-4b02-bf7e-e23d817f8cf9",
//     "org_id": "dev",
//     "name": "MiniLM L6 v2",
//     "provider": "Xenova",
//     "model": "Xenova/ms-marco-MiniLM-L-6-v2",
//     "description": "MiniLM-L-6-v2 model optimized for re-ranking tasks",
//     "size_in_gb": 0.08,
//     "created_at": "2026-05-02T09:03:10.137802Z",
//     "updated_at": "2026-05-02T09:03:10.137808Z"
//   },
//   "llm_model_credential": {
//     "id": "3dffd766-7084-4424-a3fd-d3af9718f401",
//     "org_id": "dev",
//     "name": "Openai",
//     "description": "Openai Key Bhudha",
//     "provider": "openai",
//     "api_key": "sk-proxxxxxxxxxxxxxxSGYA",
//     "created_at": "2026-05-02T20:15:19.755259Z",
//     "updated_at": "2026-05-02T20:15:19.755262Z"
//   },
//   "embedding_model_credential": {
//     "id": "87f79bd4-248b-4167-9241-09d79c6fa275",
//     "org_id": "dev",
//     "name": "Gemini",
//     "description": "Gemini api key",
//     "provider": "gemini",
//     "api_key": "AQ.Ab8xxxxxxxxxxxxxxwGFA",
//     "created_at": "2026-05-02T09:00:42.194747Z",
//     "updated_at": "2026-05-02T09:00:42.194750Z"
//   }
// }
// }

export interface ProjectDetailMetadataInterface {
  llm_model?: LLMModelInterface;
  embedding_model?: EmbeddingModelInterface;
  sparse_text_model?: SparseTextModelInterface;
  reranker?: ReRankerModelInterface;
  llm_model_credential?: ModelCredentialInterface;
  embedding_model_credential?: ModelCredentialInterface;
}

export interface ProjectDetailInterface {
  org_id: string;
  id: string;
  readable_id: string;
  name: string;
  description: string;
  details: ProjectDetailMetadataInterface;
}
