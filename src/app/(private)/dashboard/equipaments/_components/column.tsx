import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { Equipment } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const EquipamentColumn: ColumnDef<Equipment>[] = [
  {
    id: "name",
    accessorKey: "name",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome do Equipamento" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.name}</div>
    ),
  },
  {
    id: "mark",
    accessorKey: "mark",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.mark}</div>
    ),
  },
  {
    id: "model",
    accessorKey: "model",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo" />
    ,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.model} / {row.original.year}</div>
    },
  },

  {
    id: "hours",
    accessorKey: "hours",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Horas" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.hours} horas
        </div>
      )
    },
  },
  {
    id: "nextMaintenance",
    accessorKey: "nextMaintenance",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Próxima Manutenção" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.nextMaintenance?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
    },
  },
  {
    id: "lastMaintenance",
    accessorKey: "lastMaintenance",
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Última Manutenção" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.lastMaintenance?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
    },
  },
  {
    id: "amountDays",
    accessorKey: "amountDays",
    accessorFn: (row) => row.amountDays || 0,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dias/Valor" />,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.amountDays?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
    },
  },
  {
    id: "amountMoths",
    accessorKey: "amountMoths",
    accessorFn: (row) => row.amountMoths || 0,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Meses/Valor" />,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.amountMoths?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} meses</div>
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


      return (
        <div className="flex items-center gap-2 justify-center">

        </div>
      );
    },
  }

]