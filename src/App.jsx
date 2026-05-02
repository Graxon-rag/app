import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import Home from "@/pages/Home";
import Organizations from "@/pages/Organizations";
import Layout from "@/components/layout/Layout";
import Loader from "@/components/Loader";

const OrgLayout = lazy(() => import("@/pages/org/OrgLayout"));
const Projects = lazy(() => import("@/pages/org/Projects"));
const SparseModels = lazy(() => import("@/pages/org/SparseModels"));
const Rerankers = lazy(() => import("@/pages/org/Rerankers"));
const LLMModels = lazy(() => import("@/pages/org/LLMModels"));
const EmbeddingModels = lazy(() => import("@/pages/org/EmbeddingModels"));
const ModelCredential = lazy(() => import("@/pages/org/ModelCredential"));

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
              <Route path="sparse-models" element={<SparseModels />} />
              <Route path="rerankers" element={<Rerankers />} />
              <Route path="llm-models" element={<LLMModels />} />
              <Route path="embedding-models" element={<EmbeddingModels />} />
              <Route path="model-credential" element={<ModelCredential />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}
