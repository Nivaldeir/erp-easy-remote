"use client";

import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/src/shared/components/global/ui/breadcrumb";
import { useBreadcrumbs } from "@/src/shared/context/breadcrumb-context";

export function BreadcrumbContent() {
    const { crumbs } = useBreadcrumbs();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        <BreadcrumbItem>
                            {crumb.href ? (
                                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {i < crumbs.length - 1 && (
                            <BreadcrumbSeparator />
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
