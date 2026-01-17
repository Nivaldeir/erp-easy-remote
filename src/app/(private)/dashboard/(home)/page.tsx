"use client";

import { DateRangePicker, type DateRange } from "@/src/shared/components/global/date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { Badge } from "@/src/shared/components/global/ui/badge";
import { useBreadcrumbs } from "@/src/shared/context/breadcrumb-context";
import { useEffect, useMemo, useState } from "react";
import { useHome } from "./hook/home.hook";
import { formatCurrency } from "@/src/shared/lib/currency";
import { AlertTriangle, CheckCircle2, Clock, FileText, Package, Receipt, TrendingUp, Truck } from "lucide-react";

const crumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Home" }
];

export default function DashboardPage() {
  const { setCrumbs } = useBreadcrumbs();
  const { accountsSummary, contractsSummary, contasHoje, locacoesAtivas, contracts, accountsPayable } = useHome();
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  useEffect(() => setCrumbs(crumbs), [setCrumbs]);

  const filteredData = useMemo(() => {
    let filteredContracts = contracts || [];
    let filteredAccounts = accountsPayable || [];

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filteredContracts = filteredContracts.filter((contract) => {
        const initDate = contract.initDate ? new Date(contract.initDate) : null;
        const endDate = contract.endDate ? new Date(contract.endDate) : null;
        
        if (initDate && endDate) {
          return (
            (initDate >= fromDate && initDate <= toDate) ||
            (endDate >= fromDate && endDate <= toDate) ||
            (initDate <= fromDate && endDate >= toDate)
          );
        }
        return false;
      });

      filteredAccounts = filteredAccounts.filter((account) => {
        const maturity = new Date(account.maturity);
        const launchDate = new Date(account.launchDate);
        
        return (
          (maturity >= fromDate && maturity <= toDate) ||
          (launchDate >= fromDate && launchDate <= toDate)
        );
      });
    }

    return { filteredContracts, filteredAccounts };
  }, [dateRange, contracts, accountsPayable]);

  const filteredSummary = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return accountsSummary;

    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);

    const filteredAccounts = filteredData.filteredAccounts;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pagarHoje = filteredAccounts.filter((account) => {
      const maturity = new Date(account.maturity);
      maturity.setHours(0, 0, 0, 0);
      return (
        maturity.getTime() === today.getTime() &&
        account.status === "PENDING"
      );
    });

    const emAberto = filteredAccounts.filter((account) => account.status === "PENDING");
    
    const atrasado = filteredAccounts.filter((account) => {
      const maturity = new Date(account.maturity);
      return maturity < today && account.status === "PENDING";
    });

    const pagoMes = filteredAccounts.filter((account) => {
      const paidDate = account.paidDate ? new Date(account.paidDate) : null;
      return (
        account.status === "PAID" &&
        paidDate &&
        paidDate >= fromDate &&
        paidDate <= toDate
      );
    });

    return {
      pagarHoje: {
        count: pagarHoje.length,
        total: pagarHoje.reduce((sum, acc) => sum + acc.valueAmount, 0),
      },
      emAberto: {
        count: emAberto.length,
        total: emAberto.reduce((sum, acc) => sum + acc.valueAmount, 0),
      },
      atrasado: {
        count: atrasado.length,
        total: atrasado.reduce((sum, acc) => sum + acc.valueAmount, 0),
      },
      pagoMes: {
        count: pagoMes.length,
        total: pagoMes.reduce((sum, acc) => sum + acc.valueAmount, 0),
      },
    };
  }, [dateRange, filteredData, accountsSummary]);

  const filteredContractsSummary = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return contractsSummary;

    const filteredContracts = filteredData.filteredContracts;

    return {
      ativos: filteredContracts.filter((c) => c.status === "ACTIVE").length,
      pendentes: filteredContracts.filter((c) => c.status === "PENDING").length,
      finalizados: filteredContracts.filter((c) => c.status === "FINISHED").length,
      total: filteredContracts.length,
    };
  }, [dateRange, filteredData, contractsSummary]);

  const receitaLocacoes = useMemo(() => {
    const activeContracts = dateRange.from && dateRange.to 
      ? filteredData.filteredContracts.filter(c => c.status === "ACTIVE")
      : locacoesAtivas;
    
    return activeContracts.reduce((sum, contract) => {
      return sum + (contract.amountTotal || 0);
    }, 0);
  }, [dateRange, filteredData, locacoesAtivas]);

  const filteredContasHoje = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return contasHoje;
    
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);

    return filteredData.filteredAccounts.filter((account) => {
      const maturity = new Date(account.maturity);
      maturity.setHours(0, 0, 0, 0);
      return (
        maturity >= fromDate &&
        maturity <= toDate &&
        account.status === "PENDING"
      );
    });
  }, [dateRange, contasHoje, filteredData]);

  const filteredLocacoesAtivas = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return locacoesAtivas;
    return filteredData.filteredContracts.filter(c => c.status === "ACTIVE");
  }, [dateRange, locacoesAtivas, filteredData]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema financeiro e locações</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onDateChange={(dateRange) => {
              if (dateRange && "from" in dateRange) {
                setDateRange({ from: dateRange.from ?? null, to: dateRange.to ?? null });
              } else if (dateRange instanceof Date) {
                setDateRange({ from: dateRange, to: null });
              }
            }}
          />
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar Hoje</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(filteredSummary?.pagarHoje.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSummary?.pagarHoje.count || 0} contas vencem {dateRange.from && dateRange.to ? "no período" : "hoje"}
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
              {formatCurrency(filteredSummary?.emAberto.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSummary?.emAberto.count || 0} contas pendentes
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
              {formatCurrency(filteredSummary?.atrasado.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSummary?.atrasado.count || 0} contas atrasadas
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
              {formatCurrency(filteredSummary?.pagoMes.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSummary?.pagoMes.count || 0} contas pagas {dateRange.from && dateRange.to ? "no período" : "este mês"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Locação e Equipamentos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita de Locações</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(receitaLocacoes)}</div>
            <p className="text-xs text-muted-foreground">{locacoesAtivas.length} contratos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredContractsSummary?.ativos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {filteredContractsSummary?.pendentes || 0} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredContractsSummary?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {filteredContractsSummary?.finalizados || 0} finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Resumo */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Contas a Vencer Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Contas a Vencer Hoje
            </CardTitle>
            <CardDescription>Pagamentos que vencem hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredContasHoje.slice(0, 5).map((conta) => (
                <div key={conta.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{conta.supplier || "Sem fornecedor"}</p>
                    <p className="text-xs text-muted-foreground">{conta.product_and_services || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(conta.valueAmount)}</p>
                    {conta.formPayment && (
                      <Badge variant="outline" className="text-xs">
                        {conta.formPayment}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {filteredContasHoje.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {dateRange.from && dateRange.to ? "Nenhuma conta no período selecionado" : "Nenhuma conta vence hoje"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locações Ativas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Locações Ativas
            </CardTitle>
            <CardDescription>Contratos de locação em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLocacoesAtivas.slice(0, 5).map((locacao) => (
                <div key={locacao.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{locacao.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {locacao.clientName || "Sem cliente"} {locacao.workId && `• Obra`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(locacao.amountTotal || 0)}
                    </p>
                    {locacao.endDate && (
                      <p className="text-xs text-muted-foreground">
                        até {locacao.endDate.toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {filteredLocacoesAtivas.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {dateRange.from && dateRange.to ? "Nenhuma locação no período selecionado" : "Nenhuma locação ativa"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}