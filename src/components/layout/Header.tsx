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
    <nav className="border-b w-full items-center bg-sidebar">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex gap-3 items-center">
          <SidebarTrigger className="md:hidden " />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathnames.map((name, idx) => {
                const routeTo = `/${pathnames.slice(0, idx + 1).join("/")}`;
                return (
                  <span key={routeTo} className="flex items-center gap-1.5">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={routeTo}>
                          {formatBreadcrumb(decodeURIComponent(name))}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </nav>
  );
}

export default Header;
