import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import * as React from "react";
import { DataTablePagination } from "./data-table-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/shared/components/global/ui/table";

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
    table: TanstackTable<TData>;
    onRowClick?: (data: TData) => void;
    onRowDoubleClick?: (data: TData) => void;
    floatingBar?: React.ReactNode | null;
    isLoading?: boolean;
    error?: any;
}

export function DataTable<TData>({ table, children, floatingBar, onRowClick, onRowDoubleClick, isLoading, error }: DataTableProps<TData>) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {children}
            <div className="rounded-lg border shadow-sm overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-sm font-medium">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Loading state
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`loading-${index}`}>
                                    {table.getAllColumns().map((column) => (
                                        <TableCell key={column.id} className="h-16">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : error ? (
                            // Error state
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-red-600">Erro ao carregar dados</p>
                                        <p className="text-sm text-gray-500">{error?.message || "Tente novamente mais tarde"}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            // Data rows
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                    onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row.original) : undefined}
                                    className={onRowDoubleClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // Empty state
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                    Sem resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-2.5">
                <DataTablePagination table={table} />
                {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
            </div>
        </div>
    );
}
