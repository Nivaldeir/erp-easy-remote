"use client";

import { useWorkspace } from "@/src/shared/context/workspace-context";
import { Loader2 } from "lucide-react";

export function WorkspaceLoading() {
  const { isChangingWorkspace } = useWorkspace();

  if (!isChangingWorkspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando workspace...
        </p>
      </div>
    </div>
  );
}

