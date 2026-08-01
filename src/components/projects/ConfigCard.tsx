import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ConfigField {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}

interface ConfigCardProps {
  title: string;
  subtitle?: React.ReactNode;
  fields: ConfigField[];
}

function ConfigCard({ title, subtitle, fields }: ConfigCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="self-start rounded-xl border dark:border-zinc-800 overflow-hidden transition">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition"
      >
        <div className="min-w-0">
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-zinc-500 truncate">{subtitle || "Not configured"}</p>
        </div>

        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {fields.map((field, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr] gap-4 py-2 text-xs">
              <span className="text-zinc-400">{field.label}</span>
              <span
                className={`text-zinc-600 dark:text-zinc-300 text-left break-words leading-relaxed ${
                  field.mono ? "font-mono" : ""
                }`}
              >
                {field.value || "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfigCard;
