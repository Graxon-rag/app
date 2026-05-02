// {
// "id": "87f79bd4-248b-4167-9241-09d79c6fa275",
// "org_id": "dev",
// "name": "Gemini",
// "description": "Gemini api key",
// "provider": "gemini",
// "api_key": "xxxxxxxxxxxxxxxxxxxxxxx",
// "created_at": "2026-05-02T09:00:42.194747Z",
// "updated_at": "2026-05-02T09:00:42.194750Z"
// }

export interface ModelCredentialInterface {
  id: string;
  org_id: string;
  name: string;
  description: string;
  provider: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

// {
//   "org_id": "string",
//   "name": "string",
//   "description": "string",
//   "provider": "openai",
//   "api_key": "string"
// }

export interface CreateModelCredentialInterface {
  org_id: string;
  name: string;
  description: string;
  provider: string;
  api_key: string;
}
