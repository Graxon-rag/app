export interface OrgInterface {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OrgCreateInterface {
  name: string;
  description: string;
}
