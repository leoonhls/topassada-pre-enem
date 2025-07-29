import { cn } from "@/utils/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "text-white bg-gray-800 border-gray-600 hover:border-gray-500 flex w-full rounded border px-3 py-2 text-sm ring-offset-background transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-gray-500",
        "focus:outline-none focus:border-[#6b7280]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "selection:bg-primary selection:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };
