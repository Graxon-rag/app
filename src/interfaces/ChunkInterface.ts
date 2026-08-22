// {
// "chunk_id": "testprojec_txjg_doc_dxx4_chunk_27",
// "chunk_number": 27,
// "text": "xxxxxxxxxxx",
// "file_chunk_number": 0,
// "metadata": {
//     "source": "temp/mistral/image.md",
//     "byte_offset": 676,
//     "table_index": 1,
//     "row_index": 20,
//     "title": "xxxxxxxxxxxxx",
//     "kind": "table_row",
//     "filename": "image.md"
// },
// "id": "625ea8bd-4ded-41c5-a9bc-afc6924dce9b"
// }

export interface ChunkInterface {
  id: string;
  chunk_id: string;
  chunk_number: number;
  text: string;
  file_chunk_number: number;
  metadata?: Record<string, any>;
}

export interface ChunkCreateInterface {
  text: string;
  file_chunk_number: number;
  metadata?: Record<string, any>;
}

export interface ChunkUpdateInterface {
  id: string;
  text: string;
}
