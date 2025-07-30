import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "../ui/sidebar";

function Header() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  function formatBreadcrumb(name: string) {
    // Traduções simples, adicione conforme necessário
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      compras: "Compras",
      estoque: "Estoque",
      vendas: "Vendas",
      trocas: "Trocas",
      management: "Gestão",
      usuarios: "Usuários",
      fornecedores: "Fornecedores",
      produtos: "Produtos",
      tsi: "TSI",
      novo: "Novo",
      editar: "Editar",
      detalhes: "Detalhes",
      purchases: "Compras",
      listacompras: "Lista de Compras",
      novacompra: "Nova Compra",
      myusers: "Usuários",
      mytsi: "Lista de TSI",
      myproducts: "Lista de Produtos",
      myintermediary: "Lista de Intermediadores",
      mysuppliers: "Lista de Fornecedores",
    };
    const translated = map[name.toLowerCase()] || name;
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  return (
    <nav className="border-b w-full items-center bg-blue-600 text-white shadow p-4">
      <div>
        <SidebarTrigger className="md:hidden " />
        <div className="flex flex-col gap-4">
          <header className="">
            <div className="max-w-5xl">
              <h1 className="text-2xl font-bold mb-2">
                Sistema de Horários - Pré-ENEM
              </h1>
              <p className="opacity-90">
                Gestão de professores, matérias e controle de presença
              </p>
            </div>
          </header>
        </div>
      </div>
    </nav>
  );
}

export default Header;
