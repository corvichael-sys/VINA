import { Outlet, Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MobileNav } from "./MobileNav";
import { UserNav } from "./UserNav";

export const AppLayout = () => {
  return (
    <SidebarProvider> {/* Still needed for MobileNav and its trigger */}
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6 z-30">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="text-lg">VINA</span>
          </Link>

          {/* Mobile Trigger for Collapsible Menu */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          {/* Desktop Dropdown Menu */}
          <div className="hidden md:flex items-center gap-4">
            <UserNav />
          </div>
        </header>

        {/* Collapsible menu for mobile, appears below header */}
        <MobileNav />

        <main className="flex-1 p-4 sm:p-6">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};