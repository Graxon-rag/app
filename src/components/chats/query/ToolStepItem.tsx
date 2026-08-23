import { Loader2, CheckCircle2 } from "lucide-react";

export interface ToolStepData {
  id: string;
  name: string;
  input: string;
  output: string;
  status: "running" | "done";
}

interface ToolStepItemProps {
  step: ToolStepData;
  index: number;
}

export function ToolStepItem({ step, index }: ToolStepItemProps) {
  return (
    <div className="mb-2 last:mb-0 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden w-full">
      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-300">
          <span className="text-zinc-400">[{index + 1}]</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{step.name}</span>
        </div>

        {step.status === "running" ? (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500">
            <Loader2 size={10} className="animate-spin" />
            Running
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500">
            <CheckCircle2 size={10} />
            Done
          </span>
        )}
      </div>

      <div className="p-3 text-[11px] font-mono text-zinc-500 space-y-2 w-full">
        <div className="w-full">
          <span className="font-bold text-zinc-400 uppercase">Input:</span>
          <p className="mt-1 break-words whitespace-pre-wrap bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 w-full">
            {step.input || "No input"}
          </p>
        </div>

        {step.output && (
          <div className="w-full">
            <span className="font-bold text-zinc-400 uppercase">Result:</span>
            <div className="mt-1 break-words whitespace-pre-wrap bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 max-h-60 overflow-y-auto w-full">
              {step.output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
