// Central place for "what kind of file is this" logic, so upload, table,
// and any future components classify files the exact same way.

export type DocumentCategory = "text" | "image" | "audio" | "video";

// --- Extension groups -------------------------------------------------

const PLAIN_TEXT_EXTENSIONS = [".txt", ".md", ".markdown"];

const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];

const SPREADSHEET_EXTENSIONS = [".xls", ".xlsx", ".xlsm", ".csv"];

const PRESENTATION_EXTENSIONS = [".ppt", ".pptx"];

const STRUCTURED_DATA_EXTENSIONS = [".json", ".xml", ".yaml", ".yml"];

const MARKUP_EXTENSIONS = [".html", ".htm"];

const CODE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rb",
  ".php",
  ".rs",
  ".swift",
  ".kt",
  ".kts",
  ".scala",
  ".sh",
  ".bash",
  ".sql",
  ".css",
  ".scss",
  ".less",
  ".r",
  ".m",
  ".pl",
  ".lua",
  ".dart",
  ".vue",
  ".svelte",
];

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".svg",
  ".tiff",
  ".tif",
  ".heic",
  ".heif",
];

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".wma"];

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".m4v"];

// Anything that isn't audio/video/image is treated as "text" for
// processor-routing purposes (pdf, docx, xlsx, code, json, etc all end
// up going through a text/document pipeline).
const TEXT_EXTENSIONS = [
  ...PLAIN_TEXT_EXTENSIONS,
  ...DOCUMENT_EXTENSIONS,
  ...SPREADSHEET_EXTENSIONS,
  ...PRESENTATION_EXTENSIONS,
  ...STRUCTURED_DATA_EXTENSIONS,
  ...MARKUP_EXTENSIONS,
  ...CODE_EXTENSIONS,
];

// Full allow-list for the file picker / drop zone.
export const ALLOWED_EXTENSIONS = [
  ...TEXT_EXTENSIONS,
  ...IMAGE_EXTENSIONS,
  ...AUDIO_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
];

// Extensions where the source file is a "document" but can also carry
// embedded images (scanned pages, screenshots pasted into a slide, a
// photo dropped into a Word doc, etc) — these are the ones your
// pipeline needs to decide "does this need an OCR pass" for.
const OCR_CANDIDATE_EXTENSIONS = [
  ...DOCUMENT_EXTENSIONS, // .pdf, .doc, .docx
  ...PRESENTATION_EXTENSIONS, // .ppt, .pptx
];

// Value for the `accept` attribute on <input type="file">.
export const FILE_INPUT_ACCEPT = ALLOWED_EXTENSIONS.join(",");

// --- Helpers ------------------------------------------------------------

function getExtension(fileName: string): string {
  const lower = fileName.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex === -1 ? "" : lower.slice(dotIndex);
}

export function isAllowedFile(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.includes(getExtension(fileName));
}

/**
 * Broad bucket used to route to the right backend processor.
 * Everything that isn't audio/video/image falls under "text"
 * (covers txt, md, pdf, doc/docx, all excel, ppt/pptx, json, xml,
 * html, csv, yaml, and all code files).
 */
export function getDocumentCategory(fileName: string): DocumentCategory {
  const ext = getExtension(fileName);

  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "text";
}

/**
 * True for file types that are text-bearing documents but can also
 * contain embedded images (pdf, doc/docx, ppt/pptx) — meaning your
 * pipeline should consider running OCR in addition to text extraction.
 *
 * Note: this is an extension-based heuristic only. It flags the file
 * as an "OCR candidate", it does not guarantee the file actually
 * contains images — a text-only pdf will still be flagged true here.
 * Actual image detection (scanning embedded XObjects / media folders)
 * should happen server-side once the file is available, since doing
 * it reliably client-side (esp. for legacy .doc/.ppt binary formats)
 * isn't practical in the browser.
 */
export function isOcrCandidate(fileName: string): boolean {
  return OCR_CANDIDATE_EXTENSIONS.includes(getExtension(fileName));
}

export function getFileExtension(fileName: string): string {
  return getExtension(fileName);
}
