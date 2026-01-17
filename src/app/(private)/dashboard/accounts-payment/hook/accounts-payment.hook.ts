import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { AccountsPayable } from "@prisma/client";
import { AccountsPaymentColumn } from "../_components/column";
import { useQueryState } from "nuqs";
import { parseAsInteger } from "nuqs";

interface UseAccountsPaymentProps {
  search?: string;
  status?: "all" | "PENDING" | "PAID";
}

export const useAccountsPayment = ({ search, status }: UseAccountsPaymentProps = {}) => {
  const { selectedWorkspaceId } = useWorkspace();
  const [page] = useQueryState("accounts-payment-page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("accounts-payment-perPage", parseAsInteger.withDefault(10));

  const { data, isLoading: isLoadingData } = api.accountPayable.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
    search: search || undefined,
    status: (status as "all" | "PENDING" | "PAID") || "all",
    page,
    perPage,
  });

  const { data: summary, isLoading: isLoadingSummary } = api.accountPayable.getSummary.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });

  const isLoading = isLoadingData || isLoadingSummary;

  const { table } = useDataTable<AccountsPayable>({
    data: data?.data || [],
    columns: AccountsPaymentColumn,
    pageCount: data?.pageCount || 0,
    manualPagination: true,
    stateKey: "accounts-payment-",
  });

  return { table, summary, isLoading, total: data?.total || 0 };
};

