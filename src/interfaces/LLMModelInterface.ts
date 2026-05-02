// {
// "id": "daf844e6-e801-46d2-9244-b34d437188a6",
// "org_id": "dev",
// "name": "GPT-5.5",
// "provider": "openai",
// "model_name": "GPT-5.5",
// "model_id": "gpt-5.5",
// "description": "A new class of intelligence for coding and professional work.",
// "created_at": "2026-05-02T09:45:05.446247Z",
// "updated_at": "2026-05-02T09:45:05.446251Z"
// },

export interface LLMModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
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
//   "description": "string"
// }

export interface CreateLLMModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model_name: string;
  model_id: string;
  description: string;
}
