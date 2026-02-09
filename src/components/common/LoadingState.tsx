import React from "react";
import { Spinner } from "@/components/ui/spinner";

interface LoadingStateProps {
  label?: string;
  fullscreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = "Carregando...",
  fullscreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground animate-in fade-in-0 duration-300">
      <Spinner size="md" className="animate-in fade-in-0 duration-300" />
      <span className="text-xs sm:text-sm animate-pulse-slow">{label}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/65 backdrop-blur-[2px] animate-in fade-in-0 duration-200">
        <div className="rounded-xl border border-border/70 bg-card/95 shadow-lg px-6 py-5">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
