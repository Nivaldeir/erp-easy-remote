"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { Skeleton } from "@/src/shared/components/global/ui/skeleton";
import { useBreadcrumbs } from "@/src/shared/context/breadcrumb-context";
import { Filter, Plus, Search } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useContracts } from "./hook/contract.hook";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { useContractAction } from "./hook/contract.action";

const crumbs = [
  { label: "Dashboard", href: "/dashboard" }, { label: "Contratos", href: "/dashboard/contracts" },
];

function ContractsContent() {
  const { table, summary, isLoading } = useContracts();
  const { OpenFormContractModal } = useContractAction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos de Locação</h1>
          <p className="text-muted-foreground">Gerencie todos os contratos de locação de equipamentos</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="cursor-pointer" onClick={() => OpenFormContractModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-success">{summary?.ativos}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-warning">{summary?.pendentes}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Finalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{summary?.finalizados}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{summary?.total}</p>
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
            placeholder="Buscar por contrato, equipamento ou cliente..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="Ativa">Ativa</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Finalizada">Finalizada</SelectItem>
            <SelectItem value="Atrasada">Atrasada</SelectItem>
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
        <DataTable table={table} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { setCrumbs } = useBreadcrumbs();

  useEffect(() => setCrumbs(crumbs), [setCrumbs]);

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
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
      <ContractsContent />
    </Suspense>
  );
}