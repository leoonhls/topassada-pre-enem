import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

function Header() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="border-b w-full items-center bg-blue-600 text-white shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          {user && <SidebarTrigger className="md:hidden " />}
          <div>Tô Passada - Pré Enem</div>
        </div>
        {!user && (
          <Link
            to="/login"
            className="text-sm underline underline-offset-4 hover:text-gray-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Header;
