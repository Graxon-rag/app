// {
//   "org_id": "string",
//   "project_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "name": "string",
//   "url": "string",
//   "token": "string"
// }

export interface CreateWebhookInterface {
  org_id: string;
  project_id: string;
  id: string;
  name: string;
  url: string;
  token: string;
}

// {
//   "org_id": "string",
//   "project_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "name": "string",
//   "url": "string",
//   "token": "string"
//   "created_at": "2026-05-03T05:26:44.174085Z",
//   "updated_at": "2026-05-03T05:26:44.174090Z"
// }

export interface WebhookInterface {
  org_id: string;
  project_id: string;
  id: string;
  name: string;
  url: string;
  token: string;
  created_at: string;
  updated_at: string;
}
