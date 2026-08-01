// Routes a file name to the viewer component that should render it.
// This sits one layer below the coarse "text/image/audio/video" split
// used for upload/processor routing — here we need to know exactly
// which widget to mount.

export type ViewerKind =
  | "image"
  | "audio"
  | "video"
  | "pdf"
  | "office" // doc/docx/ppt/pptx
  | "spreadsheet" // xls/xlsx/xlsm/csv
  | "json"
  | "code"
  | "markdown"
  | "html"
  | "text"
  | "unsupported";

const EXTENSION_TO_VIEWER: Record<string, ViewerKind> = {
  // images
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".gif": "image",
  ".bmp": "image",
  ".webp": "image",
  ".svg": "image",
  ".tiff": "image",
  ".tif": "image",
  ".heic": "image",
  ".heif": "image",

  // audio
  ".mp3": "audio",
  ".wav": "audio",
  ".m4a": "audio",
  ".aac": "audio",
  ".flac": "audio",
  ".ogg": "audio",
  ".wma": "audio",

  // video (mkv/avi/wmv/flv are poorly supported inline — see VideoViewer,
  // which offers a download fallback for those rather than failing silently)
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".m4v": "video",
  ".avi": "video",
  ".mkv": "video",
  ".flv": "video",
  ".wmv": "video",

  // pdf
  ".pdf": "pdf",

  // office documents (no native browser rendering)
  ".doc": "office",
  ".docx": "office",
  ".ppt": "office",
  ".pptx": "office",

  // spreadsheets
  ".xls": "spreadsheet",
  ".xlsx": "spreadsheet",
  ".xlsm": "spreadsheet",
  ".csv": "spreadsheet",

  // structured data
  ".json": "json",

  // markup rendered as source, not "web page" preview
  ".xml": "code",
  ".yaml": "code",
  ".yml": "code",

  ".html": "html",
  ".htm": "html",

  ".md": "markdown",
  ".markdown": "markdown",

  ".txt": "text",
};

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

for (const ext of CODE_EXTENSIONS) {
  EXTENSION_TO_VIEWER[ext] = "code";
}

export function getExtension(fileName: string): string {
  const lower = fileName.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex === -1 ? "" : lower.slice(dotIndex);
}

export function getViewerKind(fileName: string): ViewerKind {
  const ext = getExtension(fileName);
  return EXTENSION_TO_VIEWER[ext] ?? "unsupported";
}

// Maps a viewer kind to the react-syntax-highlighter / Prism language
// string, for the code viewer's language prop.
const EXT_TO_PRISM_LANG: Record<string, string> = {
  ".js": "javascript",
  ".jsx": "jsx",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".py": "python",
  ".java": "java",
  ".c": "c",
  ".cpp": "cpp",
  ".h": "c",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".go": "go",
  ".rb": "ruby",
  ".php": "php",
  ".rs": "rust",
  ".swift": "swift",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".scala": "scala",
  ".sh": "bash",
  ".bash": "bash",
  ".sql": "sql",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".r": "r",
  ".m": "matlab",
  ".pl": "perl",
  ".lua": "lua",
  ".dart": "dart",
  ".vue": "markup",
  ".svelte": "markup",
  ".xml": "xml",
  ".yaml": "yaml",
  ".yml": "yaml",
};

export function getPrismLanguage(fileName: string): string {
  const ext = getExtension(fileName);
  return EXT_TO_PRISM_LANG[ext] ?? "text";
}

export function getFileLabel(fileName: string): string {
  const ext = getExtension(fileName);
  return ext ? ext.slice(1).toUpperCase() : "FILE";
}
