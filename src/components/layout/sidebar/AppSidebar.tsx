import { LucidePackageOpen, ShoppingCartIcon } from "lucide-react";
import * as React from "react";
import { useLocation } from "react-router-dom";

import { NavMain } from "@/components/layout/sidebar/NavMain";
import { NavUser } from "@/components/layout/sidebar/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MdCurrencyExchange,
  MdManageAccounts,
  MdOutlineDashboard,
  MdOutlineSell,
} from "react-icons/md";
import { useAuth } from "../../../contexts/AuthContext"; // Importa o contexto de autenticação
import { isAdm } from "@/utils/utils";
import { isActiveRoute } from "@/utils/routeUtils";
import InstallButton from "@/components/InstallButton";
import appIcon from "@/assets/to-passada-icon.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData } = useAuth(); // Obtém os dados do usuário do contexto

  const data = {
    user: {
      name: userData?.name || "",
      email: userData?.email || "",
      avatar: userData?.pfpUrl || "",
    },

    navMain: [
      {
        title: "Início",
        url: "/",
        isActive: isActiveRoute("/"),
      },
      {
        title: "Chamadas",
        url: "chamadas",
        isActive: isActiveRoute("chamadas"),
      },
      {
        title: "Fazer Chamada",
        url: "chamada",
        isActive: isActiveRoute("chamada"),
      },
      {
        title: "Equipe",
        url: "equipe",
        isActive: isActiveRoute("equipe"),
      },
      {
        title: "Alunos",
        url: "alunos",
        isActive: isActiveRoute("alunos"),
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <InstallButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={appIcon} alt="Tô Passada!" />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Tô Passada!</span>
                <span className="text-muted-foreground text-sm">Araguari</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
