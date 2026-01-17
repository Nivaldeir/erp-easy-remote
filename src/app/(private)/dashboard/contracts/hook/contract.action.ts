import { contractCreateInput } from "@/src/server/trpc/router/input/contract";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { StatusContracts } from "@prisma/client";
import { parseAsString, useQueryState } from "nuqs";
import { api } from "@/src/shared/context/trpc-context";
import { useEffect } from "react";
import { toast } from "sonner";
import { FormContract } from "../_components/form-contract";
import { useModal } from "@/src/shared/context/modal-context";

export const useContractAction = () => {

  const utils = api.useUtils();
  const { selectedWorkspaceId } = useWorkspace();
  const [contractId, setContractId] = useQueryState("contractId", parseAsString);

  const { openModal, closeModal } = useModal();

  const { data: contract } = api.contract.getById.useQuery({
    id: contractId || "",
  }, {
    enabled: !!contractId,
  });

  const form = useZodForm(contractCreateInput, {
    defaultValues: {
      id: contractId || "",
      status: StatusContracts.PENDING,
      workerSpaceId: selectedWorkspaceId || "",
    },
  });

  const updateContract = api.contract.createOrUpdate.useMutation({
    onSuccess: () => {
      utils.contract.getAll.invalidate();
      utils.contract.getSummary.invalidate();
      closeModal("new-contract");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleUpdateContract = (id: string) => updateContract.mutate({
    id: contractId || "",
    ...form.getValues(),
  });

  const OpenFormContractModal = (id?: string) => {
    setContractId(id || "");
    openModal(
      "new-contract",
      FormContract,
      undefined,
      { size: "xl" }
    );
  };

  useEffect(() => {
    if (contract && contract.id === contractId && contractId) {
      form.reset({
        id: contract.id,
        name: contract.name,
        description: contract.description ?? undefined,
        clientName: contract.clientName ?? undefined,
        status: contract.status,
        workId: contract.workId ?? undefined,
        equipmentId: contract.equipmentId ?? undefined,
        initDate: contract.initDate ? new Date(contract.initDate) : undefined,
        endDate: contract.endDate ? new Date(contract.endDate) : undefined,
        valueDaily: contract.valueDaily ?? undefined,
        amountDays: contract.amountDays ?? undefined,
        amountTotal: contract.amountTotal ?? undefined,
        workerSpaceId: contract.workerSpaceId,
      }, { keepDefaultValues: false });
    }
  }, [contract, contractId, form]);

  useEffect(() => {
    if (!contractId) {
      form.reset({
        id: "",
        name: "",
        description: undefined,
        clientName: undefined,
        status: StatusContracts.PENDING,
        workId: undefined,
        equipmentId: undefined,
        initDate: undefined,
        endDate: undefined,
        valueDaily: undefined,
        amountDays: undefined,
        amountTotal: undefined,
        workerSpaceId: selectedWorkspaceId || "",
      }, { keepDefaultValues: false });
    }
  }, [contractId, selectedWorkspaceId, form]);

  return { form, handleUpdateContract, OpenFormContractModal };
};