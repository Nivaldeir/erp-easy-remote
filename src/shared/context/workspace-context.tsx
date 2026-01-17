"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "./trpc-context";

interface WorkspaceContextType {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
  isLoading: boolean;
  isChangingWorkspace: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const WORKSPACE_STORAGE_KEY = "selected-workspace-id";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: workspaces, isLoading } = api.workspace.getAll.useQuery();
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChangingWorkspace, setIsChangingWorkspace] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (stored) {
        setSelectedWorkspaceIdState(stored === "null" ? null : stored);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && isInitialized && selectedWorkspaceId === null) {
      const stored = typeof window !== "undefined" ? localStorage.getItem(WORKSPACE_STORAGE_KEY) : null;

      if (!stored) {
        const firstWorkspaceId = workspaces[0].id;
        setSelectedWorkspaceIdState(firstWorkspaceId);
        if (typeof window !== "undefined") {
          localStorage.setItem(WORKSPACE_STORAGE_KEY, firstWorkspaceId);
        }
      } else {
        const workspaceExists = workspaces.some((w) => w.id === stored);
        if (!workspaceExists) {
          const firstWorkspaceId = workspaces[0].id;
          setSelectedWorkspaceIdState(firstWorkspaceId);
          if (typeof window !== "undefined") {
            localStorage.setItem(WORKSPACE_STORAGE_KEY, firstWorkspaceId);
          }
        }
      }
    }
  }, [workspaces, isInitialized, selectedWorkspaceId]);

  const setSelectedWorkspaceId = useCallback((id: string | null) => {
    // Só mostrar loading se realmente estiver mudando o workspace
    if (id !== selectedWorkspaceId) {
      setIsChangingWorkspace(true);
    }
    
    setSelectedWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      if (id === null) {
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      } else {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
      }
    }

    // Remover loading após um delay para permitir que as queries sejam refetchadas
    // As queries do tRPC serão automaticamente refetchadas quando o workspaceId mudar
    setTimeout(() => {
      setIsChangingWorkspace(false);
    }, 500);
  }, [selectedWorkspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        isLoading,
        isChangingWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

