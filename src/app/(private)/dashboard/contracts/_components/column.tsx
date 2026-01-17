import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { Contracts, Equipment, StatusContracts } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui/badge";
import { DropdownMenuContent, DropdownMenuTrigger } from "@/src/shared/components/global/ui/dropdown-menu";
import { DropdownMenuItem } from "@/src/shared/components/global/ui/dropdown-menu";
import { DropdownMenu } from "@/src/shared/components/global/ui/dropdown-menu";
import { TableOfContents } from "lucide-react";
import { useContractAction } from "../hook/contract.action";

export const ContractsColumn: ColumnDef<Contracts>[] = [
  {
    id: "name",
    accessorKey: "name",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome do Contrato" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.name}</div>
    ),
  },
  {
    id: "clientName",
    accessorKey: "clientName",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.clientName}</div>
    ),
  },
  {
    id: "initDate",
    accessorKey: "initDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Início" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.initDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
      )
    },
  },
  {
    id: "endDate",
    accessorKey: "endDate",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Término" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.endDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
    },
  },
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
      console.log(status);
      const statusLabel = {
        [StatusContracts.PENDING]: <span className="text-yellow-500">Pendente</span>,
        [StatusContracts.ACTIVE]: <span className="text-green-500">Ativa</span>,
        [StatusContracts.FINISHED]: <span className="text-green-500">Finalizada</span>,
        [StatusContracts.CANCELLED]: <span className="text-red-500">Cancelada</span>,
        [StatusContracts.INACTIVE]: <span className="text-gray-500">Inativa</span>,
      }
      return <div className="flex justify-center">
        <Badge variant="outline" className="text-center">{statusLabel[status]}</Badge>
      </div>
    },
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrição" />,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.description}</div>
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

      const { OpenFormContractModal } = useContractAction();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <TableOfContents className=" cursor-pointer text-muted-foreground bg-muted rounded-md p-1 hover:bg-muted-foreground/10 hover:text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer" onClick={() => OpenFormContractModal(row.original.id)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }

]