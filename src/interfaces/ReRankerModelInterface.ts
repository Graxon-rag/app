//  {
//  "id": "903e8428-066f-4b02-bf7e-e23d817f8cf9",
// "org_id": "dev",
// "name": "Rerank English V3.0",
// "provider_type": "cloud",
// "provider": "cohere",
// "model_name": "Cohere | rerank-english-v3.0",
// "model_id": "rerank-english-v3.0",
// "description": "A model for re-ranking English language documents and semi-structured data (JSON) with a 4096-token context length",
// "model_metadata": {},
// "size_in_gb": null,
//  "created_at": "2026-05-02T09:03:10.137802Z",
//  "updated_at": "2026-05-02T09:03:10.137808Z"
// }

export enum RerankerModelProviderTypeInterface {
  LOCAL = "local",
  CLOUD = "cloud",
}

export type RerankerModelMetadataInterface = Record<string, unknown>;

export interface ReRankerModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider_type: RerankerModelProviderTypeInterface;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  model_metadata?: RerankerModelMetadataInterface;
  size_in_gb?: number | null;
  created_at: string;
  updated_at: string;
}

// {
//"org_id": "dev",
// "name": "Rerank English V3.0",
// "provider_type": "cloud",
// "provider": "cohere",
// "model_name": "Cohere | rerank-english-v3.0",
// "model_id": "rerank-english-v3.0",
// "description": "A model for re-ranking English language documents and semi-structured data (JSON) with a 4096-token context length",
// "model_metadata": {},
// "size_in_gb": null,
// }

export interface CreateReRankerModelInterface {
  org_id: string;
  name: string;
  provider_type: RerankerModelProviderTypeInterface;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  model_metadata?: RerankerModelMetadataInterface;
  size_in_gb?: number | null;
}
