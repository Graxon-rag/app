export interface DocumentViewerProps {
  /** Presigned URL the file bytes are fetched from. */
  url: string;
  /** Original file name, used purely for extension-based routing + display. */
  fileName: string;
  /**
   * Set true only if the presigned URL is reachable by a third-party
   * server (i.e. it's not IP/auth-restricted and won't expire in the
   * next few seconds). Enables the Office/Google embed fallback for
   * doc/docx/ppt/pptx. Defaults to false, which keeps everything
   * client-side-only or download-only.
   */
  publiclyFetchable?: boolean;
  className?: string;
}

export interface ViewerProps {
  url: string;
  fileName: string;
}

export type LoadState = "loading" | "ready" | "error";
