import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreVertical, Edit2 } from "lucide-react";

export interface ConfigField {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}

interface ConfigCardProps {
  title: string;
  subtitle?: React.ReactNode;
  fields: ConfigField[];
  editable?: boolean;
  onEdit?: () => void;
}

function ConfigCard({ title, subtitle, fields, editable, onEdit }: ConfigCardProps) {
  // Now defaulting to false (collapsed) per your request
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="self-start rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121214] shadow-sm overflow-visible transition">
      <div className="flex  items-center justify-between p-4 transition rounded-t-xl hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
        {/* Clickable Accordion Area */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex-1 flex flex-col items-start text-left min-w-0 outline-none"
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-500 truncate mt-0.5">
            {subtitle || "Not configured"}
          </p>
        </button>

        {/* Actions (Menu & Chevron) */}
        <div className="flex items-center gap-2 shrink-0 ml-4 relative">
          {editable && (
            <div ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="p-1.5 rounded-md cursor-pointer text-zinc-400 hover:text-black dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-6 top-8 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-20 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (onEdit) onEdit();
                    }}
                    className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-zinc-300 transition"
          >
            <ChevronDown
              className={`w-[18px] h-[18px] transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800/40 rounded-b-xl">
          {fields.map((field, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr] gap-4 py-2.5 text-[13px] items-center"
            >
              <span className="text-zinc-500 font-medium">{field.label}</span>
              <span
                className={`text-zinc-800 dark:text-zinc-300 text-left break-words leading-relaxed ${
                  field.mono ? "font-mono text-xs opacity-90" : ""
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
