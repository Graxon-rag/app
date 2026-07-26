// {
// "id": "00deb8fe-b9f6-4610-be3c-b07f1bc4d3f3",
// "org_id": "dev",
// "name": "Deepgram",
// "provider": "deepgram",
// "model_name": "Nova-3",
// "model_id": "nova-3",
// "model_metadata": {},
// "description": "Deepgram's latest flagship speech-to-text model with the highest accuracy and multilingual support.",
// "created_at": "2026-07-26T10:54:15.225631Z",
// "updated_at": "2026-07-26T10:54:15.225636Z"
// }

export type AudioModelMetadataInterface = Record<string, unknown>;

export interface AudioModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  model_metadata?: AudioModelMetadataInterface;
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

export interface CreateAudioModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  model_metadata?: AudioModelMetadataInterface;
}
