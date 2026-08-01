import { getViewerKind } from "./file-classification";
import type { DocumentViewerProps } from "./types";
import { ImageViewer } from "./viewers/ImageViewer";
import { AudioViewer } from "./viewers/AudioViewer";
import { VideoViewer } from "./viewers/VideoViewer";
import { PdfViewer } from "./viewers/PdfViewer";
import { OfficeViewer } from "./viewers/OfficeViewer";
import { SpreadsheetViewer } from "./viewers/SpreadsheetViewer";
import { JsonViewer } from "./viewers/JsonViewer";
import { CodeViewer } from "./viewers/CodeViewer";
import { MarkdownViewer } from "./viewers/MarkdownViewer";
import { HtmlViewer } from "./viewers/HtmlViewer";
import { TextViewer } from "./viewers/TextViewer";
import { UnsupportedViewer } from "./viewers/UnsupportedViewer";

/**
 * Fetches nothing itself — takes a presigned URL + file name and mounts
 * the right inline preview widget for it. Usage:
 *
 *   <DocumentViewer url={presignedUrl} fileName={doc.fileName} />
 *
 * For doc/docx/ppt/pptx, pass `publiclyFetchable` only if the presigned
 * URL is reachable by Microsoft/Google's servers (not IP-restricted,
 * won't expire in the next minute) — otherwise those degrade to a
 * download-only card rather than a broken embed.
 */
export default function DocumentViewer({
  url,
  fileName,
  publiclyFetchable = false,
  className,
}: DocumentViewerProps) {
  const kind = getViewerKind(fileName);

  const content = (() => {
    switch (kind) {
      case "image":
        return <ImageViewer url={url} fileName={fileName} />;
      case "audio":
        return <AudioViewer url={url} fileName={fileName} />;
      case "video":
        return <VideoViewer url={url} fileName={fileName} />;
      case "pdf":
        return <PdfViewer url={url} fileName={fileName} />;
      case "office":
        return <OfficeViewer url={url} fileName={fileName} publiclyFetchable={publiclyFetchable} />;
      case "spreadsheet":
        return <SpreadsheetViewer url={url} fileName={fileName} />;
      case "json":
        return <JsonViewer url={url} fileName={fileName} />;
      case "code":
        return <CodeViewer url={url} fileName={fileName} />;
      case "markdown":
        return <MarkdownViewer url={url} fileName={fileName} />;
      case "html":
        return <HtmlViewer url={url} fileName={fileName} />;
      case "text":
        return <TextViewer url={url} fileName={fileName} />;
      default:
        return <UnsupportedViewer url={url} fileName={fileName} />;
    }
  })();

  return <div className={className}>{content}</div>;
}
