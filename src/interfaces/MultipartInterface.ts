export interface UploadPart {
  etag: string;
  part_number: number;
}

export interface UploadSession {
  documentId: string;
  uploadId: string;
  key: string;
  completedParts: UploadPart[];
}
