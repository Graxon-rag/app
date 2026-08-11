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
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DocumentViewer({
  url,
  fileName,
  publiclyFetchable = false,
  className,
}: DocumentViewerProps) {
  const { org_id, project_id } = useParams();
  const navigate = useNavigate();

  const kind = getViewerKind(fileName);

  const handleBack = () => {
    navigate(`/organizations/${org_id}/projects/${project_id}?tab=documents`);
  };

  const content = (() => {
    console.log("file Kind", kind);

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
        publiclyFetchable = true;
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

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to Documents
      </button>

      {content}
    </div>
  );
}
