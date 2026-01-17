"use client"

import type React from "react"

import { NavMain } from "@/src/shared/components/global/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/src/shared/components/global/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/global/ui/dropdown-menu"
import { api } from "@/src/shared/context/trpc-context"
import { useWorkspace } from "@/src/shared/context/workspace-context"
import { useModal } from "@/src/shared/context/modal-context"
import Link from "next/link"
import {
  LifeBuoy,
  LayoutDashboard,
  HandCoins,
  MapPinOff as MapPinHouse,
  Building2,
  MessageCircle,
  ChevronsUpDown,
  Check,
  LogOut,
  Plus,
  PlusIcon,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Contas a Pagar",
      url: "/dashboard/accounts-payment",
      icon: HandCoins,
    },
    {
      title: "Locação",
      url: "#",
      icon: MapPinHouse,
      isActive: false,
      items: [
        {
          title: "Contratos",
          url: "/dashboard/contracts",
        },
        {
          title: "Equipamentos",
          url: "/dashboard/equipaments",
        },
        {
          title: "Manutenção",
          url: "#",
        },
        {
          title: "Agenda",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: workspaces, isLoading: isLoadingWorkspaces } = api.workspace.getAll.useQuery()
  const { openModal } = useModal()
  
  let selectedWorkspaceId: string | null = null;
  let setSelectedWorkspaceId: ((id: string | null) => void) | null = null;
  
  try {
    const workspace = useWorkspace();
    selectedWorkspaceId = workspace.selectedWorkspaceId;
    setSelectedWorkspaceId = workspace.setSelectedWorkspaceId;
  } catch (error) {
    console.warn("WorkspaceProvider não disponível no AppSidebar");
  }

  const selectedWorkspace = workspaces?.find((w) => w.id === selectedWorkspaceId)
  const displayName = isLoadingWorkspaces
    ? "Carregando..."
    : selectedWorkspaceId === null
      ? "Todos os Workspaces"
      : (selectedWorkspace?.name ?? "Selecione o workspace")
  
  const handleWorkspaceChange = (id: string | null) => {
    if (setSelectedWorkspaceId) {
      setSelectedWorkspaceId(id);
    }
  }

  const handleOpenCreateWorkspaceModal = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const module = await import("@/src/shared/components/modals/form-workspace")
    openModal("create-workspace", module.FormWorkspace, undefined, {
      size: "md",
    })
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  disabled={isLoadingWorkspaces}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">Workspace</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Workspaces</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-4 h-4 rounded-sm cursor-pointer"
                    onClick={handleOpenCreateWorkspaceModal}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </DropdownMenuLabel>
                {workspaces && workspaces.length > 1 && (
                  <>
                    <DropdownMenuItem onClick={() => handleWorkspaceChange(null)} className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <Building2 className="size-4 shrink-0" />
                      </div>
                      Todos os Workspaces
                      {selectedWorkspaceId === null && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {workspaces && workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleWorkspaceChange(workspace.id)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                        <Building2 className="size-4 shrink-0" />
                      </div>
                      <span className="truncate">{workspace.name}</span>
                      {selectedWorkspaceId === workspace.id && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="gap-2 p-2 text-muted-foreground">
                    Nenhum workspace encontrado
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col items-center">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" onClick={() => signOut()}>
                <LogOut className="size-4" />
                <span>Sair</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
