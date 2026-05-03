// {
// "id": "0382d04d-3825-441d-9c6d-959b7e0a9aad",
// "org_id": "dev",
// "project_id": "746f4b94-f1cb-4e26-95b1-9778f4143273",
// "readable_id": "vipinpro_ruk2_doc_8gc7",
// "name": "Vipin Kumawat.pdf",
// "type": "application/pdf",
// "bucket": "dev",
// "key": "746f4b94-f1cb-4e26-95b1-9778f4143273/vipinpro_ruk2_doc_8gc7/Vipin Kumawat.pdf",
// "status": "PENDING",
// "created_at": "2026-05-03T10:23:01.034767Z",
// "updated_at": "2026-05-03T10:23:01.034773Z"
// },

export interface DocumentInterface {
  id: string;
  org_id: string;
  project_id: string;
  readable_id: string;
  name: string;
  type: string;
  bucket: string;
  key: string;
  status: string;
  created_at: string;
  updated_at: string;
}
