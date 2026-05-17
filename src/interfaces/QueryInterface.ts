export enum QueryType {
  QUICK = "quick",
  SMART = "smart",
  EXPERT = "expert",
}

export enum QueryDepth {
  STANDARD = "standard",
  ADVANCED = "advanced",
}

export interface QueryInterface {
  org_id: string;
  project_id: string;
  query: string;
  document_id?: string | null;
  top_k: number;
  query_type: QueryType;
  query_depth: QueryDepth;
}

export interface QueryVecSimilarChunkInterface {
  chunk_id: string;
  text: string;
  chunk_number: number;
  weight: number;
}
export interface QueryPrevNextChunkInterface {
  chunk_id: string;
  text: string;
  chunk_number: number;
  weight: number;
}

export interface QueryMetadataInterface {
  chunk_id: string;
  text: string;
  chunk_number: number;
  weight: number;
  point_score: number;
  prev_chunk?: QueryPrevNextChunkInterface | null;
  next_chunk?: QueryPrevNextChunkInterface | null;
  vector_similar_chunks?: QueryVecSimilarChunkInterface[];
}

export interface QueryLexicalEngineChunkIdInterface {
  chunk_id: string;
  score: number;
}

export interface EntityInterface {
  text: string;
  label: string;
}

export interface QueryLexicalEngineAnalysisInterface {
  raw_query: string;
  tokens: string[];
  entities: EntityInterface[];
  noun_chunks: string[];
  is_acronym_query: boolean;
  is_single_token: boolean;
  is_multi_word: boolean;
  lane_priority: [string, number][];
  normalized_query_for_lane: Record<string, string>;
}

export interface QueryResponse {
  answer: string;
  query?: string;
  metadata?: QueryMetadataInterface[];
  lexical_engine_chunk_ids?: QueryLexicalEngineChunkIdInterface[];
  lexical_engine_analysis?: QueryLexicalEngineAnalysisInterface;
}
