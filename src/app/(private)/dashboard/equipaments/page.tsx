"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { Skeleton } from "@/src/shared/components/global/ui/skeleton";
import { useBreadcrumbs } from "@/src/shared/context/breadcrumb-context";
import { Download, Filter, Package, Plus, Search } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/src/shared/components/global/ui/button";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { useEquipaments } from "./hook/equipaments.hook";
import { useQueryStates } from "nuqs";
import { searchEquipaments } from "./utils/equipaments";

const crumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Equipamentos" }
];

function EquipamentContent() {
  const [{ search: searchParam, status: statusParam }, setParams] = useQueryStates(searchEquipaments);
  const [searchInput, setSearchInput] = useState(searchParam || "");

  const { table, data, isLoading } = useEquipaments({ 
    search: searchParam || undefined, 
    status: (statusParam as "all" | "available" | "rented" | "maintenance" | "inactive") || "all" 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (searchParam || "")) {
        setParams({ search: searchInput || null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchParam, setParams]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipamentos</h1>
          <p className="text-muted-foreground">Gestão da frota de máquinas e equipamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
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
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.length || 0}</p>
                <p className="text-sm text-muted-foreground">na frota</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {data && data.length > 0 
                    ? Math.round((data.filter((e: any) => e.hasActiveContract).length / data.length) * 100)
                    : 0}%
                </p>
                {/* <Progress value={0} className="mt-2" /> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  {data?.filter((e: any) => !e.hasActiveContract).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">prontos para locação</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Em Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">
                  {data?.filter(e => {
                    if (e.nextMaintenance) {
                      const nextMaintenance = new Date(e.nextMaintenance);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return nextMaintenance <= today;
                    }
                    return false;
                  }).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">em reparo</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou marca..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select 
          value={statusParam || "all"} 
          onValueChange={(value) => setParams({ status: value === "all" ? null : value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="rented">Locado</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Equipamentos */}
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

export default function EquipamentPage() {
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
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
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
      <EquipamentContent />
    </Suspense>
  );
}