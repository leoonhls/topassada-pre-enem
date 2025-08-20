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

  return (
    <nav className="border-b w-full items-center bg-blue-600 text-white shadow p-4">
      <div className="flex gap-2 items-start">
        <SidebarTrigger className="md:hidden " />
        <div>Tô Passada - Pré Enem</div>
      </div>
    </nav>
  );
}

export default Header;
