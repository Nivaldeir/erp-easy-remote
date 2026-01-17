"use client";

import { ModalProps } from "@/src/shared/types/modal";
import { Button } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { StatusAccountsPayable } from "@prisma/client";
import { DateRangePicker } from "@/src/shared/components/global/date-picker";
import { Form, FormField, FormLabel, FormItem, FormControl } from "@/src/shared/components/global/ui/form";
import { useAccountsPayableAction } from "../hook/accounts-payable.action";

export function ModalNewAccountPayable({ onClose }: ModalProps) {
  const { form, handleSubmit } = useAccountsPayableAction();

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Nova Conta a Pagar</h2>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do fornecedor" />
                  </FormControl>
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="nf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota Fiscal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o número da NF" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="issuer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Emissão</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        if (date instanceof Date) {
                          field.onChange(date);
                        } else if (date && typeof date === "object" && "from" in date && date.from) {
                          field.onChange(date.from);
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      mode="single"
                      placeholder="Data de lançamento"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_and_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produtos e Serviços</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite produtos e serviços" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="construction_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo da obra</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o custo da obra" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="valueAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o valor da conta a pagar" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valueTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o valor total da conta a pagar" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o número de parcelas" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onValueChange={(value) => field.onChange(value as StatusAccountsPayable)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={StatusAccountsPayable.PENDING}>Pendente</SelectItem>
                        <SelectItem value={StatusAccountsPayable.PAID}>Pago</SelectItem>
                        <SelectItem value={StatusAccountsPayable.LATE}>Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="launchDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Lançamento</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        if (date instanceof Date) {
                          field.onChange(date);
                        } else if (date && typeof date === "object" && "from" in date && date.from) {
                          field.onChange(date.from);
                        } else {
                          field.onChange(new Date());
                        }
                      }}
                      mode="single"
                      placeholder="Data de lançamento"
                    />
                  </FormControl>
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="maturity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        if (date instanceof Date) {
                          field.onChange(date);
                        } else if (date && typeof date === "object" && "from" in date && date.from) {
                          field.onChange(date.from);
                        } else {
                          field.onChange(new Date());
                        }
                      }}
                      mode="single"
                      placeholder="Data de vencimento"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        if (date instanceof Date) {
                          field.onChange(date);
                        } else if (date && typeof date === "object" && "from" in date && date.from) {
                          field.onChange(date.from);
                        } else {
                          field.onChange(new Date());
                        }
                      }}
                      mode="single"
                      placeholder="Data de pagamento"
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