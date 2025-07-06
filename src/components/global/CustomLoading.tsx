import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  className?: string;
};

const CustomLoading = ({ title = "Loading...", className }: Props) => {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300",
        className
      )}
    >
      <Loader2 className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
};

export default CustomLoading;
