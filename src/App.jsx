import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import Home from "@/pages/Home";
import Organizations from "@/pages/Organizations";
import Layout from "@/components/layout/Layout";
import Loader from "@/components/Loader";
import { Toaster } from "react-hot-toast";

const OrgLayout = lazy(() => import("@/pages/org/OrgLayout"));
const Projects = lazy(() => import("@/pages/org/Projects"));
const SparseModels = lazy(() => import("@/pages/org/SparseModels"));
const Rerankers = lazy(() => import("@/pages/org/Rerankers"));
const LLMModels = lazy(() => import("@/pages/org/LLMModels"));
const AudioModels = lazy(() => import("@/pages/org/AudioModels"));
const VideoModels = lazy(() => import("@/pages/org/VideoModels"));
const OCRModels = lazy(() => import("@/pages/org/OCRModels"));
const EmbeddingModels = lazy(() => import("@/pages/org/EmbeddingModels"));
const ModelCredential = lazy(() => import("@/pages/org/ModelCredential"));
const CreateProject = lazy(() => import("@/pages/org/CreateProject"));
const ProjectDetail = lazy(() => import("@/pages/org/ProjectDetail"));
const DocumentQuery = lazy(() => import("@/pages/org/DocumentQuery"));
const DocumentViewer = lazy(() => import("@/pages/org/DocumentViewer"));
const Chunks = lazy(() => import("@/pages/org/Chunks"));
const Chats = lazy(() => import("@/pages/org/Chats"));

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:org_id" element={<OrgLayout />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/create" element={<CreateProject />} />
              <Route path="projects/:project_id" element={<ProjectDetail />} />
              <Route path="projects/:project_id/docs/:doc_id/query" element={<DocumentQuery />} />
              <Route path="projects/:project_id/docs/:doc_id/view" element={<DocumentViewer />} />
              <Route path="projects/:project_id/docs/:doc_id/chunks" element={<Chunks />} />
              <Route
                path="projects/:project_id/docs/:doc_id/chunks/:chunk_id"
                element={<Chunks />}
              />
              <Route path="projects/:project_id/chats" element={<Chats />} />
              <Route path="sparse-models" element={<SparseModels />} />
              <Route path="rerankers" element={<Rerankers />} />
              <Route path="llm-models" element={<LLMModels />} />
              <Route path="audio-models" element={<AudioModels />} />
              <Route path="ocr-models" element={<OCRModels />} />
              <Route path="video-models" element={<VideoModels />} />
              <Route path="embedding-models" element={<EmbeddingModels />} />
              <Route path="model-credential" element={<ModelCredential />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </ThemeProvider>
  );
}
