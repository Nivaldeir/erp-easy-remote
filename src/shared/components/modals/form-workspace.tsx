"use client";

import { ModalProps } from "@/src/shared/types/modal";
import { Button } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Form, FormItem, FormControl, FormLabel, FormField, FormMessage } from "@/src/shared/components/global/ui/form";
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { workspaceCreateInput } from "@/src/server/trpc/router/input/workspace";
import { api } from "@/src/shared/context/trpc-context";
import { toast } from "sonner";
import { Textarea } from "@/src/shared/components/global/ui/textarea";
import { useWorkspace } from "@/src/shared/context/workspace-context";

export function FormWorkspace({ onClose }: ModalProps) {
  const utils = api.useUtils();
  
  let setSelectedWorkspaceId: ((id: string | null) => void) | null = null;
  try {
    const workspace = useWorkspace();
    setSelectedWorkspaceId = workspace.setSelectedWorkspaceId;
  } catch (error) {
    console.warn("WorkspaceProvider não disponível no FormWorkspace");
  }

  const form = useZodForm(workspaceCreateInput, {
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: async (workspace) => {
      toast.success("Workspace criado com sucesso");
      
      await utils.workspace.getAll.invalidate();
      
      if (setSelectedWorkspaceId) {
        setSelectedWorkspaceId(workspace.id);
        if (typeof window !== "undefined") {
          localStorage.setItem("selected-workspace-id", workspace.id);
        }
      }
      
      setTimeout(() => {
        onClose();
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar workspace");
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createWorkspace.mutateAsync(data);
    } catch (error) {
      console.error("Erro ao criar workspace:", error);
    }
  });

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Criar Workspace</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Crie seu primeiro workspace para começar a gerenciar seus projetos.
      </p>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Workspace</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome do workspace" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Digite uma descrição para o workspace"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? "Criando..." : "Criar Workspace"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

