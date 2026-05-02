//  {
//     "id": "903e8428-066f-4b02-bf7e-e23d817f8cf9",
//     "org_id": "dev",
//     "name": "MiniLM L6 v2",
//     "provider": "Xenova",
//     "model": "Xenova/ms-marco-MiniLM-L-6-v2",
//     "description": "MiniLM-L-6-v2 model optimized for re-ranking tasks",
//     "size_in_gb": 0.08,
//     "created_at": "2026-05-02T09:03:10.137802Z",
//     "updated_at": "2026-05-02T09:03:10.137808Z"
// }

export interface ReRankerModelInterface {
  id: string;
  org_id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  size_in_gb: number;
  created_at: string;
  updated_at: string;
}

// {
//   "org_id": "string",
//   "name": "string",
//   "provider": "string",
//   "model": "string",
//   "description": "string",
//   "size_in_gb": 0
// }

export interface CreateReRankerModelInterface {
  org_id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  size_in_gb: number;
}
