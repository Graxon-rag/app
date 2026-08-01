import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Maximize2, X, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { getFileLabel } from "../../file-classification";

const iconTriggerClass =
  "inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 dark:hover:bg-neutral-700/70 dark:hover:text-neutral-100";

function TooltipWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={4}
            className="rounded bg-neutral-900 px-2 py-1 text-xs text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
          >
            {label}
            <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function Toolbar({
  fileName,
  url,
  fullscreenContent,
}: {
  fileName: string;
  url: string;
  /** If provided, renders a fullscreen (Radix Dialog) trigger showing this content large. */
  fullscreenContent?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50/80 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
        <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {fileName}
        </span>
        <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {getFileLabel(fileName)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {fullscreenContent && (
          <Dialog.Root>
            <TooltipWrap label="Fullscreen">
              <Dialog.Trigger asChild>
                <button aria-label="Open fullscreen" className={iconTriggerClass}>
                  <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </Dialog.Trigger>
            </TooltipWrap>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in" />
              <Dialog.Content className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-neutral-950 md:inset-10">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
                  <Dialog.Title className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {fileName}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-900">
                  {fullscreenContent}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
        <TooltipWrap label="Download">
          <a
            href={url}
            download={fileName}
            aria-label={`Download ${fileName}`}
            className={iconTriggerClass}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        </TooltipWrap>
      </div>
    </div>
  );
}
