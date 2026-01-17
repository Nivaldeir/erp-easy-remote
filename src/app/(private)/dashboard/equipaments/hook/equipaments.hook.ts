import { useDataTable } from "@/src/shared/hook/use-data-table";
import { Equipment } from "@prisma/client";
import { EquipamentColumn } from "../_components/column";
import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";

interface UseEquipamentsProps {
  search?: string;
  status?: "all" | "available" | "rented" | "maintenance" | "inactive";
}

export const useEquipaments = ({ search, status }: UseEquipamentsProps = {}) => {
  const { selectedWorkspaceId } = useWorkspace();
  
  const { data, isLoading } = api.equipament.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
    search: search || undefined,
    status: status || undefined,
  });

  const { table } = useDataTable<Equipment>({
    data: data || [],
    columns: EquipamentColumn,
    pageCount: 0,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return { table, data, isLoading };
};