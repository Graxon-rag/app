// {
// "id": "f422b2fc-e131-4e40-afae-e3f8318ae118",
// "org_id": "dev",
// "name": "Mistral Latest",
// "provider": "mistral",
// "model_name": "OCR Latest",
// "model_id": "mistral-ocr-latest",
// "description": "Latest model for datalab.",
// "model_metadata": {},
// "created_at": "2026-07-26T11:46:12.780099Z",
// "updated_at": "2026-07-26T11:46:12.780103Z"
// }

export type OCRModelMetadataInterface = Record<string, unknown>;

export interface OCRModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  model_metadata?: OCRModelMetadataInterface;
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

export interface CreateOCRModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
  model_metadata?: OCRModelMetadataInterface;
}
