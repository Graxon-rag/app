import { Hexagon, GitBranch, Zap, ShieldCheck, Network } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link } from "react-router-dom";
import logo from "@/assets/img/Graxon-wbg.png";

const features = [
  {
    icon: Network,
    title: "Persistent Knowledge Graph",
    desc: "Entities and relationships are stored in a structured graph layer that persists across queries.",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Hallucination Elimination",
    desc: "Every generated fact is grounded and validated against the graph before output.",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    title: "Hybrid Retrieval",
    desc: "Combines sparse BM25/SPLADE, dense embeddings, and graph traversal for maximum recall.",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Low Latency Pipeline",
    desc: "Optimized reranking and context compression deliver answers in milliseconds.",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/5 dark:bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="Graxon" width={80} />
            <div>
              <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-50">
                Graxon
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                Open-Source · Hybrid RAG
              </p>
            </div>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed max-w-2xl mb-6">
            The first open-source{" "}
            <span className="text-primary-600 dark:text-primary-400 font-semibold">Hybrid RAG</span>{" "}
            platform designed to eliminate hallucinations through a persistent{" "}
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              Knowledge Graph layer
            </span>
            . Graxon unifies sparse retrieval, dense embeddings, and graph-based reasoning into a
            single orchestration layer.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/organizations"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold
               bg-primary-600 hover:bg-primary-700 text-white
               shadow-sm shadow-primary-500/20 transition-all duration-150"
            >
              View Organizations
            </Link>

            <a
              href="https://github.com/Graxon-rag/graxon"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg
               border border-border bg-background text-sm font-medium text-foreground
               transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <SiGithub className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <p className="section-label mb-3">Core Capabilities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${f.color}`}
              >
                <f.icon size={17} strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 text-sm">
                {f.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
