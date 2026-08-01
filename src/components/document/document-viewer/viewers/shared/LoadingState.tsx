import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading preview…" }: { label?: string }) {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-neutral-500">
      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
