"use client";

import { Button } from "@/src/shared/components/global/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

interface type {
    getIsSorted: () => "asc" | "desc" | false
    toggleSorting: (desc?: boolean) => void
}

export function DataTableColumnHeader({ column, title, className }: { column: type; title: string, className?: string }) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-center space-x-1 w-full"
        >
            <span className={`text-center ${className}`}>{title}</span>
            {{
                asc: <ArrowUp className="h-3 w-3" />,
                desc: <ArrowDown className="h-3 w-3" />,
            }[column.getIsSorted() as string] ?? null}
        </Button>
    );
}
