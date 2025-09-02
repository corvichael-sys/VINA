import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { PiggyBank } from "lucide-react"; // Corrected ' = ' to ' from '
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { MobileNav } from "./MobileNav";
import { mainNavItems, settingsNavItem, NavItem } from "@/config/nav"; // Import NavItem type

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b"> {/* Added border-b here */}
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold px-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <span className="text-lg group-data-[collapsible=icon]:hidden">VINA</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainNavItems.map((item: NavItem) => ( // Explicitly type item as NavItem
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                onClick={() => navigate(item.href)}
                isActive={location.pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => navigate(settingsNavItem.href)}
                    isActive={location.pathname.startsWith(settingsNavItem.href)}
                    tooltip={settingsNavItem.label}
                >
                    <settingsNavItem.icon className="size-4" />
                    <span>{settingsNavItem.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppLayout = () => {
  const { profile, logout } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 sticky top-0 z-30">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="w-full flex-1">
            {/* Breadcrumbs or other header content can go here */}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{profile?.username || 'User'}</span>
            <Button onClick={logout} variant="outline" size="sm">Sign Out</Button>
          </div>
        </header>
        <MobileNav />
        <main className="flex-1 p-4 sm:p-6 min-w-0 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};