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
        title: "Dashboard",
        url: "/",
        icon: MdOutlineDashboard,
        isActive: isActiveRoute("/"),
      },
      {
        title: "Estoque",
        url: "estoque",
        icon: LucidePackageOpen,
        isActive: isActiveRoute("estoque"),
      },
      {
        title: "Vendas",
        url: "ListaVendas",
        icon: MdOutlineSell,
        isActive: isActiveRoute("ListaVendas"),
      },
      {
        title: "Compras",
        url: "#",
        icon: ShoppingCartIcon,
        isActive: isActiveRoute("#", [
          { url: "novaCompra" },
          { url: "listaCompras" },
        ]),
        items: [
          {
            title: "Nova Compra",
            url: "novaCompra",
            isActive: isActiveRoute("novaCompra"),
          },
          {
            title: "Lista de Compras",
            url: "listaCompras",
            isActive: isActiveRoute("listaCompras"),
          },
        ],
      },
      {
        title: "Trocas",
        url: "#",
        icon: MdCurrencyExchange,
        isActive: isActiveRoute("#", [
          { url: "novaTroca" },
          { url: "listaTrocas" },
        ]),
        items: [
          {
            title: "Nova Troca",
            url: "novaTroca",
            isActive: isActiveRoute("novaTroca"),
          },
          {
            title: "Lista de Trocas",
            url: "listaTrocas",
            isActive: isActiveRoute("listaTrocas"),
          },
        ],
      },

      {
        title: "Gestão",
        url: "",
        icon: MdManageAccounts,
        hidden: !isAdm(),
        isActive: isActiveRoute("#", [
          { url: "usuarios" },
          { url: "tsi" },
          { url: "produtos" },
          { url: "intermediadores" },
          { url: "fornecedores" },
          { url: "financeiro" },
          { url: "clientes" },
          { url: "producao" },
        ]),
        items: [
          {
            title: "Usuários",
            url: "usuarios",
            isActive: isActiveRoute("usuarios"),
          },
          {
            title: "Lista de TSI",
            url: "tsi",
            isActive: isActiveRoute("tsi"),
          },
          {
            title: "Produtos",
            url: "produtos",
            isActive: isActiveRoute("produtos"),
          },
          {
            title: "Produção",
            url: "producao",
            isActive: isActiveRoute("producao"),
          },
          {
            title: "Intermediadores",
            url: "intermediadores",
            isActive: isActiveRoute("intermediadores"),
          },
          {
            title: "Fornecedores",
            url: "fornecedores",
            isActive: isActiveRoute("fornecedores"),
          },
          {
            title: "Financeiro",
            url: "financeiro",
            isActive: isActiveRoute("financeiro"),
          },
          {
            title: "Clientes",
            url: "clientes",
            isActive: isActiveRoute("clientes"),
          },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src="src\assets\topassada-pre-enem-icon.png"
                    alt="Tô Passada!"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Tô Passada!</span>
                  <span className="text-muted-foreground text-sm">
                    Araguari
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain.filter((item) => !item.hidden)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
