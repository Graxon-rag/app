import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleProps {
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number | React.ReactNode;
  children: React.ReactNode;
  headerClassName?: string;
}

export function Collapsible({
  label,
  icon,
  defaultOpen = false,
  badge,
  children,
  headerClassName = "",
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors
          bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/70
          text-zinc-500 dark:text-zinc-400 ${headerClassName}`}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}

          {badge !== undefined && (
            <span className="ml-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none flex items-center justify-center">
              {badge}
            </span>
          )}
        </span>

        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && <div className="p-3 bg-white dark:bg-zinc-950 w-full">{children}</div>}
    </div>
  );
}
