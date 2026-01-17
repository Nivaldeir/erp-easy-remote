"use client";

import { ModalProps } from "@/src/shared/types/modal";
import { Button } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { StatusContracts } from "@prisma/client";
import { DateRangePicker, type DateRange } from "@/src/shared/components/global/date-picker";
import { Form, FormItem, FormControl, FormLabel, FormField } from "@/src/shared/components/global/ui/form";
import { useContractAction } from "../hook/contract.action";

export function FormContract({ onClose }: ModalProps) {
  const { selectedWorkspaceId } = useWorkspace();
  const { form, handleUpdateContract } = useContractAction();

  const { data: equipments, isLoading: isLoadingEquipments } = api.equipament.getAll.useQuery({
    workspaceId: selectedWorkspaceId || undefined,
  });
  console.log("form", form.getValues());
  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{form.getValues("id") ? "Editar Contrato" : "Novo Contrato"}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleUpdateContract(data.id || ""))} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Contrato</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome do contrato" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome do cliente" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite a descrição" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as StatusContracts)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StatusContracts.PENDING}>Pendente</SelectItem>
                      <SelectItem value={StatusContracts.ACTIVE}>Ativo</SelectItem>
                      <SelectItem value={StatusContracts.FINISHED}>Finalizado</SelectItem>
                      <SelectItem value={StatusContracts.INACTIVE}>Inativo</SelectItem>
                      <SelectItem value={StatusContracts.CANCELLED}>Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obra</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as StatusContracts)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {equipments && equipments.length > 0 ? (
                        equipments.map((equipment) => (
                          <SelectItem key={equipment.id} value={equipment.id}>
                            {equipment.name} - {equipment.model}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período do Contrato</FormLabel>
                <FormControl>
                  <DateRangePicker
                    value={{
                      from: field.value ? new Date(field.value) : null,
                      to: field.value ? new Date(field.value) : null,
                    }}
                    onDateChange={(dateRange) => {
                      if (dateRange && "from" in dateRange) {
                        field.onChange(dateRange.from || undefined);
                      } else if (dateRange instanceof Date) {
                        field.onChange(dateRange);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />


          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valueDaily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Diário</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      placeholder="Digite o valor diário"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Dias</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Digite a quantidade de dias"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      placeholder="Digite o valor total"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

