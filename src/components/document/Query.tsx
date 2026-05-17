import QueryIndex from "@/components/query/Index";
import { useParams } from "react-router-dom";

function QueryDocument() {
  const { doc_id } = useParams<{
    doc_id: string;
  }>();
  return <QueryIndex doc_id={doc_id} />;
}

export default QueryDocument;
