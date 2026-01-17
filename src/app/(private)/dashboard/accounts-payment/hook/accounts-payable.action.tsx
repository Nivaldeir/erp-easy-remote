import { accountPayableCreateInput } from "@/src/server/trpc/router/input/account-payable";
import { useModal } from "@/src/shared/context/modal-context";
import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { useZodForm } from "@/src/shared/hook/use-zod-form"
import { StatusAccountsPayable } from "@prisma/client";
import { toast } from "sonner";
import { z } from "zod";
import { parseAsString, useQueryState } from "nuqs";
import { ModalNewAccountPayable } from "../_components/form-account-payable";
import { useEffect } from "react";

const accountPayableFormSchema = accountPayableCreateInput.extend({
  valueAmount: z.coerce.number().positive("Valor deve ser positivo"),
  valueTotal: z.coerce.number().positive("Valor total deve ser positivo"),
  installments: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return val;
    },
    z.coerce.number().int().positive().optional()
  ),
  status: z.nativeEnum(StatusAccountsPayable),
});


export const useAccountsPayableAction = () => {
  const { selectedWorkspaceId } = useWorkspace();
  
  const [accountPayableId, setAccountPayableId] = useQueryState("accountPayableId", parseAsString.withDefault(""));

  const utils = api.useUtils();
  const { closeModal, openModal } = useModal();

  const { data: accountPayable } = api.accountPayable.getById.useQuery({
    id: accountPayableId || "",
  }, {
    enabled: !!accountPayableId,
  });

  const form = useZodForm(accountPayableFormSchema, {
    defaultValues: {
      id: accountPayableId || "",
      status: StatusAccountsPayable.PENDING,
      installments: undefined,
      workerSpaceId: selectedWorkspaceId || "",
      launchDate: new Date(),
      valueAmount: 0,
      valueTotal: 0,
      maturity: new Date(),
      paidDate: undefined,
    },
  });

  useEffect(() => {
    if (accountPayable) {
      form.reset({
        nf: accountPayable.nf ?? undefined,
        issuer: accountPayable.issuer ? new Date(accountPayable.issuer) : undefined,
        supplier: accountPayable.supplier ?? undefined,
        product_and_services: accountPayable.product_and_services ?? undefined,
        construction_cost: accountPayable.construction_cost ?? undefined,
        formPayment: accountPayable.formPayment ?? undefined,
        valueAmount: accountPayable.valueAmount,
        installments: accountPayable.installments ?? undefined,
        valueTotal: accountPayable.valueTotal,
        maturity: new Date(accountPayable.maturity),
        launchDate: new Date(accountPayable.launchDate),
        paidDate: accountPayable.paidDate ? new Date(accountPayable.paidDate) : undefined,
        status: accountPayable.status as StatusAccountsPayable,
        workerSpaceId: accountPayable.workerSpaceId,
      });
    } else if (!accountPayableId) {
      form.reset({
        status: StatusAccountsPayable.PENDING,
        installments: undefined,
        workerSpaceId: selectedWorkspaceId || "",
        launchDate: new Date(),
        valueAmount: 0,
        valueTotal: 0,
        maturity: new Date(),
        paidDate: undefined,
      });
    }
  }, [accountPayable, accountPayableId, selectedWorkspaceId, form]);

  const createAccountPayable = api.accountPayable.createOrUpdate.useMutation({
    onSuccess: () => {
      toast.success("Conta a pagar criada com sucesso");
      utils.accountPayable.getAll.invalidate();
      utils.accountPayable.getSummary.invalidate();
      closeModal("new-account-payable");
    },
    onError: () => {
      toast.error("Erro ao criar conta a pagar");
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createAccountPayable.mutateAsync({
        ...data,
        id: accountPayableId || undefined,
      });
    } catch (error) {
      toast.error("Erro ao criar conta a pagar");
      console.error(error);
      throw error;
    }
  });

  const handleEditAccountPayable = (id: string) => {
    setAccountPayableId(id);
    openModal("new-account-payable", ModalNewAccountPayable, undefined, { size: "xl" });
  };
  return {
    form,
    handleSubmit,
    handleEditAccountPayable
  };
}