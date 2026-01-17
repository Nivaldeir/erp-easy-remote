import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { AccountsPayable, StatusAccountsPayable } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui/badge";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/shared/components/global/ui/dropdown-menu";
import { DropdownMenu } from "@/src/shared/components/global/ui/dropdown-menu";
import { MoreHorizontal, TableOfContents } from "lucide-react";
import { useAccountsPayableAction } from "../hook/accounts-payable.action";
import { formatCurrency } from "@/src/shared/lib/currency";

export const AccountsPaymentColumn: ColumnDef<AccountsPayable>[] = [
  // 1. Nota fiscal
  {
    id: "nf",
    accessorKey: "nf",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nota Fiscal" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.nf || "-"}</div>
    ),
  },
  // 2. Data de emissão
  {
    id: "issueDate",
    accessorKey: "launchDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Emissão" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.launchDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      );
    },
  },
  // 3. Fornecedor
  {
    id: "supplier",
    accessorKey: "supplier",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fornecedor" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.supplier || "-"}</div>
    ),
  },
  // 4. Produto / Serviço
  {
    id: "product_and_services",
    accessorKey: "product_and_services",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produto / Serviço" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.product_and_services || "-"}</div>
    ),
  },
  // 5. Custo da obra
  {
    id: "construction_cost",
    accessorKey: "construction_cost",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Custo da Obra" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.construction_cost || "-"}</div>
    ),
  },
  // 6. Forma de pagamento
  {
    id: "formPayment",
    accessorKey: "formPayment",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Forma de Pagamento" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.formPayment || "-"}</div>
    ),
  },
  // 7. Valor nota fiscal
  {
    id: "valueTotal",
    accessorKey: "valueTotal",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Nota Fiscal" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {formatCurrency(row.original.valueTotal)}
        </div>
      );
    },
  },
  // 8. Parcela
  {
    id: "installments",
    accessorKey: "installments",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parcela" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.installments || "-"}</div>
    ),
  },
  // 9. Valor da parcela
  {
    id: "valueAmount",
    accessorKey: "valueAmount",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor da Parcela" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {formatCurrency(row.original.valueAmount)}
        </div>
      );
    },
  },
  // 10. Vencimento Original
  {
    id: "maturity",
    accessorKey: "maturity",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vencimento Original" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.maturity.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      );
    },
  },
  // 11. Lançamento
  {
    id: "launchDate",
    accessorKey: "launchDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lançamento" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.launchDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      );
    },
  },
  // 12. Data de pagamento
  {
    id: "paidDate",
    accessorKey: "paidDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Pagamento" />
    ),
    cell: ({ row }) => {
      if (!row.original.paidDate) return <div className="text-center">-</div>;
      return (
        <div className="flex justify-center">
          {row.original.paidDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      );
    },
  },
  // 13. Status
  {
    id: "status",
    accessorKey: "status",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const statusLabel = {
        [StatusAccountsPayable.PENDING]: <span className="text-yellow-500">Pendente</span>,
        [StatusAccountsPayable.PAID]: <span className="text-green-500">Pago</span>,
        [StatusAccountsPayable.LATE]: <span className="text-red-500">Atrasado</span>,
      };
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-center">
            {statusLabel[status]}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 10,
    minSize: 10,
    header: () => <p className="flex items-center justify-center space-x-1 w-full">Ação</p>,
    cell: function Cell({ row }) {
      const { handleEditAccountPayable } = useAccountsPayableAction();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <TableOfContents className=" cursor-pointer text-muted-foreground bg-muted rounded-md p-1 hover:bg-muted-foreground/10 hover:text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditAccountPayable(row.original.id)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Excluir</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Pagar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


