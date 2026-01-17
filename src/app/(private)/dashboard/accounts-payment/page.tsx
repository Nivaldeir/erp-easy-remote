"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { Skeleton } from "@/src/shared/components/global/ui/skeleton";
import { useBreadcrumbs } from "@/src/shared/context/breadcrumb-context";
import { useModal } from "@/src/shared/context/modal-context";
import { AlertTriangle, CheckCircle2, Clock, Download, Filter, Plus, Receipt, Search, Upload } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAccountsPayment } from "./hook/accounts-payment.hook";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { ModalNewAccountPayable } from "./_components/form-account-payable";
import { useQueryStates } from "nuqs";
import { searchAccountsPayment } from "./utils/accounts-payment";
import { formatCurrency } from "@/src/shared/lib/currency";
import { useAccountsPayableAction } from "./hook/accounts-payable.action";
import { CsvUpload } from "@/src/shared/components/global/csv-upload";
import { api } from "@/src/shared/context/trpc-context";
import { useWorkspace } from "@/src/shared/context/workspace-context";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/src/shared/hook/use-debounced-callback";

const crumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contas a Pagar", href: "/dashboard/accounts-payment" },
];

function AccountsPaymentContent() {
  const { openModal } = useModal();
  const { handleEditAccountPayable } = useAccountsPayableAction();
  const utils = api.useUtils();
  const { selectedWorkspaceId } = useWorkspace();
  
  const [{ search: searchParam, status: statusParam }, setParams] = useQueryStates(searchAccountsPayment);
  const [searchInput, setSearchInput] = useState(searchParam || "");
  const searchParamRef = useRef(searchParam);

  const { table, summary, isLoading } = useAccountsPayment({
    search: searchParam || undefined,
    status: (statusParam as "all" | "PENDING" | "PAID") || "all",
  });

  const createAccountPayable = api.accountPayable.createOrUpdate.useMutation({
    onSuccess: () => {
      utils.accountPayable.getAll.invalidate();
      utils.accountPayable.getSummary.invalidate();
    },
  });

  useEffect(() => {
    searchParamRef.current = searchParam;
  }, [searchParam]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value !== (searchParamRef.current || "")) {
      setParams({ search: value || null, page: null });
    }
  }, 800);

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const handleOpenNewAccountPayableModal = () => {
    openModal(
      "new-account-payable",
      ModalNewAccountPayable,
      undefined,
      { size: "xl" }
    );
  };

  const handleCsvUpload = async (data: {
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
    fileName: string;
    fileSize: number;
  }) => {
    if (!selectedWorkspaceId) {
      toast.error("Selecione um workspace primeiro");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of data.rows) {
        try {
          const getValue = (keys: string[]) => {
            for (const key of keys) {
              const value = row[key]?.trim();
              if (value && value !== "" && value !== "-") {
                return value;
              }
            }
            return null;
          };

          const parseCurrency = (value: string | null): number => {
            if (!value) return 0;
            let cleaned = value
              .replace(/R\$\s*/gi, "")
              .replace(/\s+/g, "")
              .trim();
            
            if (cleaned.includes(".") && cleaned.includes(",")) {
              const lastDot = cleaned.lastIndexOf(".");
              const lastComma = cleaned.lastIndexOf(",");
              if (lastComma > lastDot) {
                cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
              } else {
                cleaned = cleaned.replace(/,/g, "");
              }
            } else {
              cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
            }
            
            return parseFloat(cleaned) || 0;
          };

          const parseDate = (value: string | null): Date | null => {
            if (!value || value === "-" || value === "") return null;
            const dateStr = value.trim();
            
            if (dateStr.includes("/")) {
              const parts = dateStr.split("/");
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
            
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
          };

          const maturity = getValue([
            "VENCIMENTO",
            "Data de Vencimento",
            "maturity",
            "vencimento",
            "data_vencimento",
          ]);
          
          const launchDate = getValue([
            "LANÇAMENTO",
            "Data de Lançamento",
            "launchDate",
            "data_lancamento",
          ]) || new Date().toISOString().split("T")[0];

          const valueStr = getValue([
            "VALOR",
            "Valor",
            "valueAmount",
            "valor",
          ]);

          const valueTotalStr = getValue([
            "VALOR TOTAL NF",
            "Valor Total",
            "valueTotal",
            "valor_total",
          ]) || valueStr;

          const valueAmount = parseCurrency(valueStr);
          const valueTotal = parseCurrency(valueTotalStr);

          if (!maturity || !valueAmount || valueAmount <= 0) {
            errorCount++;
            continue;
          }

          const maturityDate = parseDate(maturity);
          const launchDateObj = parseDate(launchDate) || new Date();
          const paidDateObj = parseDate(getValue([
            "PAGO",
            "Data de Pagamento",
            "paidDate",
            "data_pagamento",
          ]));

          if (!maturityDate) {
            errorCount++;
            continue;
          }

          const statusValue = getValue(["STATUS", "Status", "status"]) || "PENDING";
          const status = statusValue.toUpperCase().includes("PAGO") || statusValue.toUpperCase() === "PAID" 
            ? "PAID" 
            : "PENDING";

          await createAccountPayable.mutateAsync({
            workerSpaceId: selectedWorkspaceId,
            nf: getValue(["NF", "Nota Fiscal", "nf", "nota_fiscal"]) || undefined,
            issuer: parseDate(getValue(["EMISSÃO", "Emissão", "issuer"])) || undefined,
            supplier: getValue([
              "FORNECEDOR / FAVORECIDO",
              "FORNECEDOR",
              "Fornecedor",
              "supplier",
              "fornecedor",
            ]) || undefined,
            product_and_services: getValue([
              "PRODUTO / SERVIÇO",
              "PRODUTO / SERVIÇO",
              "Produtos e Serviços",
              "product_and_services",
              "produtos_servicos",
            ]) || undefined,
            construction_cost: getValue([
              "CUSTO OBRA",
              "Custo da Construção",
              "construction_cost",
            ]) || undefined,
            formPayment: getValue([
              "FORMA DE PG",
              "Forma de Pagamento",
              "formPayment",
              "forma_pagamento",
            ]) || undefined,
            valueAmount,
            valueTotal,
            installments: getValue(["PARCELA", "Parcelas", "installments"])
              ? parseInt(getValue(["PARCELA", "Parcelas", "installments"]) || "1")
              : undefined,
            maturity: maturityDate,
            launchDate: launchDateObj,
            paidDate: paidDateObj || undefined,
            status: status as "PENDING" | "PAID",
          });

          successCount++;
        } catch (error) {
          console.error("Erro ao criar conta:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} conta(s) importada(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} conta(s) não puderam ser importadas.`);
      }
    } catch (error) {
      console.error("Erro ao processar CSV:", error);
      toast.error("Erro ao importar contas do CSV");
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contas a Pagar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie todas as contas a pagar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CsvUpload 
            onUploadComplete={handleCsvUpload}
            className="flex-1 sm:flex-initial"
          />
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={handleOpenNewAccountPayableModal} className="flex-1 sm:flex-initial">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Conta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Pagar Hoje</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(summary?.pagarHoje.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.pagarHoje.count || 0} contas vencem hoje
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-chart-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
                <Receipt className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">
                  {formatCurrency(summary?.emAberto.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.emAberto.count || 0} contas pendentes
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atrasado</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary?.atrasado.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.atrasado.count || 0} contas atrasadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pago este Mês</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(summary?.pagoMes.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.pagoMes.count || 0} contas pagas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por fornecedor, nota fiscal ou produto..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Select 
          value={statusParam || "all"} 
          onValueChange={(value) => setParams({ status: value === "all" ? null : value, page: null })}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="PAID">Pago</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable 
          table={table} 
          onRowDoubleClick={(data) => handleEditAccountPayable(data.id)}
        />
      )}
    </div>
  );
}

export default function AccountsPaymentPage() {
  const { setCrumbs } = useBreadcrumbs();

  useEffect(() => setCrumbs(crumbs), [setCrumbs]);

  return (
    <Suspense fallback={
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AccountsPaymentContent />
    </Suspense>
  );
}