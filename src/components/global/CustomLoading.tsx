import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  className?: string;
}

const CustomLoading = ({ title = "Loading...", className }: Props) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full",
        "bg-gradient-to-br from-background/80 via-muted/80 to-slate-200/80 dark:from-black/80 dark:via-slate-900/80 dark:to-gray-900/80 backdrop-blur-lg",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col items-center justify-center px-6 py-8 sm:px-10 sm:py-12 rounded-2xl shadow-2xl bg-white/70 dark:bg-black/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl max-w-xs w-full">
        <div className="mb-4">
          <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-primary/70 to-purple-600/70 dark:from-primary/60 dark:to-purple-700/60 shadow-lg">
            <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary dark:text-primary-300" />
          </span>
        </div>
        <span className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-wide drop-shadow-lg text-center">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CustomLoading;
