import { ModelCredentialInterface } from "@/interfaces/ModelCredentialInterface";
import { EmbeddingModelInterface } from "@/interfaces/EmbeddingModelInterface";
import { SparseTextModelInterface } from "@/interfaces/SparseTextModelInterface";
import { ReRankerModelInterface } from "@/interfaces/ReRankerModelInterface";
import { LLMModelInterface } from "@/interfaces/LLMModelInterface";
import { OCRModelInterface } from "@/interfaces/OCRModelInterface";
import { AudioModelInterface } from "@/interfaces/AudioModelInterface";
import { VideoModelInterface } from "@/interfaces/VideoModelInterface";

// {
// "id": "3dfc7a4a-928d-424e-9138-3d5d25179a9f",
// "readable_id": "test_dt27",
// "org_id": "dev",
// "name": "Test",
// "description": "Test",
// "created_at": "2026-05-03T05:26:44.174085Z",
// "updated_at": "2026-05-03T05:26:44.174090Z"
// }

export interface ProjectInterface {
  id: string;
  readable_id: string;
  org_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// {
//   "org_id": "string",
//   "name": "string",
//   "description": "string",
//   "project_metadata": {},
//   "config": {}
// }

export interface ProjectConfigCreateInterface {
  project_id: string;

  graph_db_enable: boolean;
  reranker_enable: boolean;
  sparse_embedding_enable: boolean;
  llm_tag_extraction_enable: boolean;

  llm_model_id: string;
  llm_model_credential_id: string;

  embedding_model_id: string;
  embedding_model_credential_id: string;

  ocr_model_id: string | null;
  ocr_model_credential_id: string | null;

  sparse_text_model_id: string | null;
  sparse_text_model_credential_id: string | null;

  reranker_model_id: string | null;
  reranker_model_credential_id: string | null;

  audio_model_id: string | null;
  audio_model_credential_id: string | null;

  video_model_id: string | null;
  video_model_credential_id: string | null;
}

export interface ProjectConfigGetInterface {
  id: string;
  project_id: string;

  graph_db_enable: boolean;
  reranker_enable: boolean;
  sparse_embedding_enable: boolean;
  llm_tag_extraction_enable: boolean;

  llm_model_id: string;
  llm_model_credential_id: string;

  embedding_model_id: string;
  embedding_model_credential_id: string;

  ocr_model_id: string | null;
  ocr_model_credential_id: string | null;

  sparse_text_model_id: string | null;
  sparse_text_model_credential_id: string | null;

  reranker_model_id: string | null;
  reranker_model_credential_id: string | null;

  audio_model_id: string | null;
  audio_model_credential_id: string | null;

  video_model_id: string | null;
  video_model_credential_id: string | null;

  created_at: string;
  updated_at: string;
}
export interface ProjectConfigUpdateInterface {
  llm_model_id?: string;
  llm_model_credential_id?: string;

  sparse_text_model_id?: string | null;
  sparse_text_model_credential_id?: string | null;

  reranker_model_id?: string | null;
  reranker_model_credential_id?: string | null;

  ocr_model_id?: string | null;
  ocr_model_credential_id?: string | null;

  audio_model_id?: string | null;
  audio_model_credential_id?: string | null;

  video_model_id?: string | null;
  video_model_credential_id?: string | null;

  llm_tag_extraction_enable?: boolean;
  reranker_enable?: boolean;
}

// {
//   "success": true,
//   "message": "Success",
//   "data": {
//     "id": "0899aa88-6709-41f6-af2a-cd0a244dccac",
//     "project_id": "85860c1a-7aa9-4d5a-bb90-6f96caa1341c",
//     "llm_model": {
//       "id": "1512cea1-582f-408f-a3cd-ad54bfabc5f6",
//       "org_id": "dev",
//       "name": "Gemini 3.1 Pro",
//       "provider": "gemini",
//       "model_name": "Gemini 3.1 Pro",
//       "model_id": "gemini-3.1-pro-preview",
//       "description": "Advanced intelligence model with strong reasoning, problem-solving, and agentic coding capabilities.",
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "embedding_model": {
//       "org_id": "dev",
//       "name": "Gemini Embedding 001",
//       "provider": "gemini",
//       "model_name": "gemini-embedding-001",
//       "model_id": "gemini-embedding-001",
//       "dimension": 1536,
//       "description": "Text embedding model optimized for semantic search, document retrieval, and recommendation systems with flexible dimensional output.",
//       "id": "5cfea504-f002-4ee6-b552-bb181be8f874",
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "reranker_model": {
//       "id": "7dd13b06-eeca-4570-93ea-b003b41fae04",
//       "org_id": "dev",
//       "name": "Jina Reranker Tiny EN",
//       "provider_type": "local",
//       "provider": "jina",
//       "model_name": "Jinaai | jina-reranker-v1-tiny-en",
//       "model_id": "jinaai/jina-reranker-v1-tiny-en",
//       "description": "Blazing-fast English reranker with ~8K context support",
//       "model_metadata": {},
//       "size_in_gb": 0.13,
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "sparse_text_model": {
//       "id": "9562b326-868e-4b18-8c76-c2bf95a0c37b",
//       "org_id": "dev",
//       "name": "Splade++ EN v1",
//       "provider_type": "local",
//       "provider": "prithivida",
//       "model_name": "Prithivida | Splade_PP_en_v1",
//       "model_id": "prithivida/Splade_PP_en_v1",
//       "description": "SPLADE++ sparse embedding model for English retrieval tasks",
//       "model_metadata": {},
//       "size_in_gb": 0.532,
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "ocr_model": {
//       "id": "c4c8f945-5f21-4586-8e73-c9720ee36b18",
//       "org_id": "dev",
//       "name": "Mistral OCR 4",
//       "provider": "mistral",
//       "model_name": "OCR 4",
//       "model_id": "mistral-ocr-4-0",
//       "description": "OCR 4 model for datalab.",
//       "model_metadata": {},
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "audio_model": {
//       "id": "ff6cbaf9-ffba-4cbc-8d4a-6e29e45d54cd",
//       "org_id": "dev",
//       "name": "Deepgram",
//       "provider": "deepgram",
//       "model_name": "Nova-3",
//       "model_id": "nova-3",
//       "model_metadata": {},
//       "description": "Deepgram's latest flagship speech-to-text model with the highest accuracy and multilingual support.",
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "video_model": {
//       "id": "dd27acd8-7b97-4dd1-9619-39b3a5427830",
//       "org_id": "dev",
//       "name": "TwelveLabs",
//       "provider": "twelvelabs",
//       "model_name": "Pegasus 1.2",
//       "model_id": "pegasus1.2",
//       "description": "A multimodal AI model for analyzing videos, generating summaries, answering questions, and extracting insights from video content.",
//       "model_metadata": {},
//       "created_at": "2026-08-01T10:28:10.205661Z",
//       "updated_at": "2026-08-01T10:28:10.205661Z"
//     },
//     "llm_model_credential": {
//       "id": "3e9d7aa3-63ef-482c-801e-a14b9c31f9da",
//       "org_id": "dev",
//       "name": "Gemini API KEY",
//       "description": "",
//       "provider": "gemini",
//       "api_key": "xxxxxxxxxxxxxxNwGFA",
//       "created_at": "2026-08-01T15:54:07.225754Z",
//       "updated_at": "2026-08-01T15:54:07.225757Z"
//     },
//     "embedding_model_credential": {
//       "id": "3e9d7aa3-63ef-482c-801e-a14b9c31f9da",
//       "org_id": "dev",
//       "name": "Gemini API KEY",
//       "description": "",
//       "provider": "gemini",
//       "api_key": "xxxxxxxxxxxxxxNwGFA",
//       "created_at": "2026-08-01T15:54:07.225754Z",
//       "updated_at": "2026-08-01T15:54:07.225757Z"
//     },
//     "sparse_text_model_credential": null,
//     "reranker_model_credential": null,
//     "ocr_model_credential": {
//       "id": "5cb7a224-cce0-48ac-9843-bb6735a30a15",
//       "org_id": "dev",
//       "name": "Mistral API Key",
//       "description": "MD",
//       "provider": "mistral",
//       "api_key": "xxxxxxxxxxxxxxa61vZ",
//       "created_at": "2026-08-03T18:14:21.714173Z",
//       "updated_at": "2026-08-03T18:14:21.714180Z"
//     },
//     "audio_model_credential": {
//       "id": "c28ebb92-d0d6-40f2-ab41-069a57712a7d",
//       "org_id": "dev",
//       "name": "Deepgram API Key",
//       "description": "DD",
//       "provider": "deepgram",
//       "api_key": "xxxxxxxxxxxxxx0dc9b",
//       "created_at": "2026-08-03T18:15:02.065521Z",
//       "updated_at": "2026-08-03T18:15:02.065524Z"
//     },
//     "video_model_credential": {
//       "id": "f5338550-91d5-4377-9f39-6b876ca17304",
//       "org_id": "dev",
//       "name": "Twelvelabs API Key",
//       "description": "TD",
//       "provider": "twelvelabs",
//       "api_key": "xxxxxxxxxxxxxxYTYH1",
//       "created_at": "2026-08-03T18:15:49.158307Z",
//       "updated_at": "2026-08-03T18:15:49.158313Z"
//     },
//     "created_at": "2026-08-03T18:40:59.164523Z",
//     "updated_at": "2026-08-03T18:40:59.164527Z"
//   }
// }

export interface ProjectConfigDetailInterface {
  id: string;
  project_id: string;
  llm_model: LLMModelInterface;
  llm_model_credential: ModelCredentialInterface;

  embedding_model: EmbeddingModelInterface;
  embedding_model_credential: ModelCredentialInterface;

  sparse_text_model?: SparseTextModelInterface;
  sparse_text_model_credential?: ModelCredentialInterface;

  reranker_model?: ModelCredentialInterface;
  reranker_model_credential?: ModelCredentialInterface;

  ocr_model?: OCRModelInterface;
  ocr_model_credential?: ModelCredentialInterface;

  audio_model?: AudioModelInterface;
  audio_model_credential?: ModelCredentialInterface;

  video_model?: VideoModelInterface;
  video_model_credential?: ModelCredentialInterface;

  created_at: string;
  updated_at: string;
}

export interface CreateProjectInterface {
  org_id: string;
  name: string;
  description: string;
  config: ProjectConfigCreateInterface;
  project_metadata?: any;
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
