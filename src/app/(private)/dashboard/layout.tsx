"use client";

import { AppSidebar } from "@/src/shared/components/global/app-sidebar";
import { BreadcrumbContent } from "@/src/shared/components/global/breadcrumb-content";
import { Separator } from "@/src/shared/components/global/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/shared/components/global/ui/sidebar";
import { WorkspaceLoading } from "@/src/shared/components/global/workspace-loading";
import { BreadcrumbProvider } from "@/src/shared/context/breadcrumb-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset className="max-h-full overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbContent />
            </div>
          </header>
          <div className="flex flex-1 max-h-full overflow-hidden flex-col gap-4 p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
        <WorkspaceLoading />
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}