"use client";

import { createContext, useContext, useState } from "react";

export type Crumb = {
    label: string;
    href?: string;
};

type BreadcrumbContextValue = {
    crumbs: Crumb[];
    setCrumbs: (crumbs: Crumb[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [crumbs, setCrumbs] = useState<Crumb[]>([]);
    return (
        <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumbs() {
    const ctx = useContext(BreadcrumbContext);
    if (!ctx) throw new Error("useBreadcrumbs must be inside BreadcrumbProvider");
    return ctx;
}
