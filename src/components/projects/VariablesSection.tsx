import React, { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { DefaultVariableItem } from "@/interfaces/ProjectInterface";
import { useProjectStore } from "@/store/projectStore"; // Adjust path if needed

interface ProjectVariablesSectionProps {
  values: Record<string, string | number>;
  onInit: (defaults: Record<string, string | number>) => void;
  onChange: (key: string, value: string | number) => void;
}

export function ProjectVariablesSection({
  values,
  onInit,
  onChange,
}: ProjectVariablesSectionProps) {
  const [definitions, setDefinitions] = useState<DefaultVariableItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { getProjectVariableDefaults } = useProjectStore();

  useEffect(() => {
    const fetchDefaults = async () => {
      setLoading(true);
      try {
        const defs = await getProjectVariableDefaults();

        if (defs && defs.length > 0) {
          setDefinitions(defs);

          // Convert the array into a flat object for the initial parent state
          const initialValues: Record<string, string | number> = {};
          defs.forEach((d) => {
            // Automatically convert string numbers into actual numbers
            const numVal = Number(d.value);
            initialValues[d.key] = isNaN(numVal) ? d.value : numVal;
          });
          onInit(initialValues);
        }
      } catch (error) {
        console.error("Failed to load project variable defaults", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm text-sm text-zinc-500">
        Loading advanced variables...
      </div>
    );
  }

  function SectionHeading({
    dot,
    title,
    pill,
    optional,
  }: {
    dot: string;
    title: string;
    pill?: string;
    optional?: boolean;
  }) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        {optional && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            optional
          </span>
        )}
        {pill && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
            {pill}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <SectionHeading dot="bg-indigo-500" title="Advanced Variables" />

      <div className="mt-2 mb-4 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-700">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
        <p className="text-sm font-medium">
          Warning: These chunking and threshold configurations can only be set now and{" "}
          <strong>cannot be modified after the project is created</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
        {definitions.map((def) => (
          <div key={def.key}>
            <label
              className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5"
              title={def.key}
            >
              {def.key.replace(/_/g, " ")}
            </label>
            <input
              type={isNaN(Number(def.value)) ? "text" : "number"}
              step="any"
              className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
              value={values[def.key] ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                // Parse numbers dynamically before passing to parent
                onChange(def.key, val === "" || isNaN(Number(val)) ? val : Number(val));
              }}
            />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {def.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
