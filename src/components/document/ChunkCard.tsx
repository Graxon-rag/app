import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  Edit2,
  FileText,
  ChevronDown,
  ChevronUp,
  Hash,
  Check,
  X,
  TriangleAlert,
} from "lucide-react";
import { ChunkInterface } from "@/interfaces/ChunkInterface";

export function ChunkCard({ chunk }: { chunk: ChunkInterface }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Track confirmation state
  const [currentText, setCurrentText] = useState(chunk.text);
  const [editedText, setEditedText] = useState(chunk.text);

  const handleEditClick = () => {
    setIsOpen(true); // Force open the collapsible to show the full textarea
    setEditedText(currentText);
    setIsEditing(true);
    setShowConfirm(false); // Reset confirmation state
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowConfirm(false);
    setEditedText(currentText);
  };

  const handleInitiateSave = () => {
    // If nothing changed, just close it
    if (editedText === currentText) {
      handleCancelEdit();
      return;
    }
    // Otherwise, ask for confirmation
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    const updatedChunk = { ...chunk, text: editedText };
    console.log("Edited chunk saved:", updatedChunk);

    // Update local state to reflect the changes immediately
    setCurrentText(editedText);
    setIsEditing(false);
    setShowConfirm(false);
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            {/* Primary: Readable Chunk ID */}
            <h3
              className="text-sm font-semibold text-black dark:text-white truncate"
              title={chunk.chunk_id}
            >
              {chunk.chunk_id}
            </h3>

            {/* Secondary: Human-readable metrics */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Chunk #{chunk.chunk_number}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span>File Chunk #{chunk.file_chunk_number}</span>
            </div>

            {/* Tertiary: Technical UUID */}
            <p
              className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate mt-0.5"
              title={`UUID: ${chunk.id}`}
            >
              UUID: {chunk.id}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="p-2 text-zinc-400 hover:text-black cursor-pointer dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title="Edit Chunk"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Metadata Badges */}
      {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800/50">
          {Object.entries(chunk.metadata).map(([key, value]) => {
            // Filter out long text fields from badges if needed
            if (typeof value !== "string" && typeof value !== "number") return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50"
              >
                <span className="text-zinc-400">{key}:</span>
                <span className="truncate max-w-[150px]" title={String(value)}>
                  {value}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <Collapsible.Root
        open={isOpen}
        onOpenChange={!isEditing ? setIsOpen : undefined}
        className="p-4"
      >
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              // Editing Mode
              <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  disabled={showConfirm}
                  className="w-full min-h-[150px] p-3 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-shadow resize-y"
                  placeholder="Edit chunk text..."
                />

                {showConfirm ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 mt-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg animate-in slide-in-from-top-2">
                    {/* Icon and Text - Vertically Centered */}
                    <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400">
                      <TriangleAlert className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-medium leading-snug">
                        Confirm changes? This action cannot be automatically undone.
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmSave}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-md transition-colors shadow-sm cursor-pointer"
                      >
                        Yes, save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleInitiateSave}
                      className="inline-flex items-center cursor-pointer gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Viewing Mode
              <>
                <div
                  className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap ${
                    !isOpen && "line-clamp-3"
                  }`}
                >
                  {currentText}
                </div>

                <Collapsible.Trigger asChild>
                  <button className="mt-2 flex items-center gap-1 cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline outline-none">
                    {isOpen ? (
                      <>
                        Show less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </Collapsible.Trigger>
              </>
            )}
          </div>
        </div>
      </Collapsible.Root>
    </div>
  );
}
