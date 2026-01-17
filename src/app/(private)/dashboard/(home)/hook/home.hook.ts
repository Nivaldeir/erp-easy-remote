import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";

export const useHome = () => {
  const { selectedWorkspaceId } = useWorkspace();
  
  const { data: accountsSummary } = api.accountPayable.getSummary.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });
  
  const { data: contractsSummary } = api.contract.getSummary.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });
  
  const { data: contracts } = api.contract.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });

  const { data: accountsPayableData } = api.accountPayable.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
    page: 1,
    perPage: 1000,
  });

  const accountsPayable = accountsPayableData?.data || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const contasHoje = accountsPayable.filter((account) => {
    const maturity = new Date(account.maturity);
    maturity.setHours(0, 0, 0, 0);
    return (
      maturity.getTime() >= today.getTime() &&
      maturity.getTime() < tomorrow.getTime() &&
      account.status === "PENDING"
    );
  });

  const locacoesAtivas = contracts?.filter(
    (contract) => contract.status === "ACTIVE"
  ) || [];

  return {
    accountsSummary,
    contractsSummary,
    contasHoje,
    locacoesAtivas,
    contracts,
    accountsPayable,
  };
};

