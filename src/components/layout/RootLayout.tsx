import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../common/ThemeProvider";
import { SidebarProvider } from "../ui/sidebar";
import Header from "./Header";
import { AppSidebar } from "./sidebar/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
function RootLayout() {
  const { user } = useAuth();
  return (
    <ThemeProvider>
      <SidebarProvider>
        {user && <AppSidebar />}
        <div className="w-full min-h-screen overflow-x-hidden">
          <Header />
          <div className="w-full overflow-x-hidden">
            <Outlet />
            <Toaster />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
