// {
// "id": "aeac5b24-6032-4812-abef-ff2a4f84e64e",
// "org_id": "dev",
// "name": "TwelveLabs",
// "provider": "twelvelabs",
// "model_name": "Pegasus 1.2",
// "model_id": "pegasus1.2",
// "description": "A multimodal AI model for analyzing videos, generating summaries, answering questions, and extracting insights from video content.",
// "model_metadata": {},
// "created_at": "2026-07-26T11:25:31.074253Z",
// "updated_at": "2026-07-26T11:25:31.074257Z"
// }

export type VideoModelMetadataInterface = Record<string, unknown>;

export interface VideoModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  model_metadata?: VideoModelMetadataInterface;
  description: string;
  created_at: string;
  updated_at: string;
}

// {
// "org_id": "string",
// "name": "string",
// "provider": "deepgram",
// "model_name": "string",
// "model_id": "string",
// "description": "string",
// "model_metadata": {}
// }

export interface CreateVideoModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  model_metadata?: VideoModelMetadataInterface;
}
