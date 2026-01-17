import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { Contracts } from "@prisma/client";
import { ContractsColumn } from "../_components/column";

export const useContracts = () => {
  const { selectedWorkspaceId } = useWorkspace();
  
  const { data, isLoading: isLoadingData } = api.contract.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });

  const { data: summary, isLoading: isLoadingSummary } = api.contract.getSummary.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });

  const isLoading = isLoadingData || isLoadingSummary;

  const { table } = useDataTable<Contracts>({
    data: data || [],
    columns: ContractsColumn,
    pageCount: 0,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return { table, summary, isLoading };
};