import React, { useEffect, useState, useMemo } from "react";
import { Settings2, Info, Search } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { DefaultVariableItem } from "@/interfaces/ProjectInterface";

interface MergedVariableItem extends DefaultVariableItem {
  projectValue: string | number;
  isModified: boolean;
}

interface VariablesDetailSectionProps {
  orgId: string;
  projectId: string;
}

export function VariablesDetailSection({ orgId, projectId }: VariablesDetailSectionProps) {
  const [variables, setVariables] = useState<MergedVariableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { getProjectVariableDefaults, getProjectVariablesByProject } = useProjectStore();

  useEffect(() => {
    const fetchAndMergeData = async () => {
      setLoading(true);
      try {
        const [defaults, projectVars] = await Promise.all([
          getProjectVariableDefaults(),
          getProjectVariablesByProject(orgId, projectId),
        ]);

        if (defaults && projectVars) {
          const mergedData = defaults.map((def) => {
            const customValue = projectVars[def.key];
            const hasCustomValue = customValue !== undefined && customValue !== null;
            const isModified = hasCustomValue && String(customValue) !== String(def.value);

            return {
              ...def,
              projectValue: hasCustomValue ? customValue : def.value,
              isModified,
            };
          });

          setVariables(mergedData);
        }
      } catch (error) {
        console.error("Failed to load project variables for detail view", error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId && projectId) {
      fetchAndMergeData();
    }
  }, [orgId, projectId, getProjectVariableDefaults, getProjectVariablesByProject]);

  // Frontend-only search filter with underscore/space normalization
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return variables;

    const lowerQuery = searchQuery.toLowerCase();

    return variables.filter((v) => {
      // Create a display-friendly key (e.g. "max_tokens" -> "max tokens")
      const originalKey = v.key.toLowerCase();
      const displayKey = originalKey.replace(/_/g, " ");

      // Check if the query matches either the raw key with underscores OR the displayed key with spaces
      const matchKey = originalKey.includes(lowerQuery) || displayKey.includes(lowerQuery);

      const matchDescription = v.description.toLowerCase().includes(lowerQuery);
      const matchValue = String(v.projectValue).toLowerCase().includes(lowerQuery);

      return matchKey || matchDescription || matchValue;
    });
  }, [variables, searchQuery]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm">
          <Settings2 className="w-5 h-5 animate-spin" />
          Loading advanced configurations...
        </div>
      </div>
    );
  }

  if (variables.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
            <Settings2 className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white">Advanced Variables</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Fixed chunking and threshold configurations applied during creation.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Variables Grid */}
      {filteredVariables.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Search className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No variables found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          {filteredVariables.map((v) => (
            <div
              key={v.key}
              className="group flex flex-col justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <label
                    className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider line-clamp-1"
                    title={v.key}
                  >
                    {v.key.replace(/_/g, " ")}
                  </label>

                  {v.isModified ? (
                    <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400">
                      Modified
                    </span>
                  ) : (
                    <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-medium text-black dark:text-white">
                    {v.projectValue}
                  </span>
                  {v.isModified && (
                    <span
                      className="text-xs text-zinc-400 dark:text-zinc-500 line-through"
                      title="Original default value"
                    >
                      {v.value}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/50 mt-auto">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
