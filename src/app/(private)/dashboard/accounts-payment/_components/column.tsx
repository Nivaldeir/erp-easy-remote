import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { AccountsPayable, StatusAccountsPayable } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui/badge";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/shared/components/global/ui/dropdown-menu";
import { DropdownMenu } from "@/src/shared/components/global/ui/dropdown-menu";
import { MoreHorizontal, TableOfContents } from "lucide-react";
import { useAccountsPayableAction } from "../hook/accounts-payable.action";
import { formatCurrency } from "@/src/shared/lib/currency";
import { formatDate } from "@/src/shared/lib/date";

export const AccountsPaymentColumn: ColumnDef<AccountsPayable>[] = [
  // 1. Nota fiscal
  {
    id: "nf",
    accessorKey: "nf",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NF" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.nf?.toString() || "-"}</div>
    ),
  },
  // 2. Data de emissão
  {
    id: "issueDate",
    accessorKey: "launchDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Em." />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {formatDate(row.original.launchDate)}
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
      <DataTableColumnHeader column={column} title="Fornec." />
    ),
    cell: ({ row }) => (
      <div className="text-start max-w-40 truncate">{row.original.supplier?.toString() || "-"}</div>
    ),
  },
  // 4. Produto / Serviço
  {
    id: "product_and_services",
    accessorKey: "product_and_services",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prod. / Serv." />
    ),
    cell: ({ row }) => (
      <div className="text-start max-w-40 truncate">{row.original.product_and_services?.toString() || "-"}</div>
    ),
  },
  // 5. Custo da obra
  {
    id: "construction_cost",
    accessorKey: "construction_cost",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Custo Obr." />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.construction_cost?.toString() || "-"}</div>
    ),
  },
  // 6. Forma de pagamento
  {
    id: "formPayment",
    accessorKey: "formPayment",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Forma Pag." />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.formPayment?.toString() || "-"}</div>
    ),
  },
  // 7. Valor nota fiscal
  {
    id: "valueTotal",
    accessorKey: "valueTotal",
    enableSorting: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor NF" />
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
      <DataTableColumnHeader column={column} title="Parcelas" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.installments?.toString() || "-"}</div>
    ),
  },
  // 9. Valor da parcela
  {
    id: "valueAmount",
    accessorKey: "valueAmount",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Parcela" />
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
      <DataTableColumnHeader column={column} title="Vencimento" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {formatDate(row.original.maturity)}
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
      <DataTableColumnHeader column={column} title="Lanç." />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {formatDate(row.original.launchDate)}
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
      <DataTableColumnHeader column={column} title="Pag." />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {formatDate(row.original.paidDate)}
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
      <DataTableColumnHeader column={column} title="Situação" />
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


