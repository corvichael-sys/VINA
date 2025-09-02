import { useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mainNavItems, settingsNavItem, NavItem } from "@/config/nav";
import { useSession } from "@/context/SessionContext";
import { LogOut } from "lucide-react";

export const MobileNav = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const { logout } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (href: string) => {
    navigate(href);
    setOpenMobile(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setOpenMobile(false);
  };

  return (
    <div className="md:hidden">
      <Collapsible open={openMobile} onOpenChange={setOpenMobile}>
        <CollapsibleContent className="overflow-hidden bg-background data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="flex flex-col gap-2 border-b p-4">
            <nav className="flex flex-col gap-1">
              {mainNavItems.map((item: NavItem) => (
                <Button
                  key={item.href}
                  variant={location.pathname.startsWith(item.href) ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleNavigate(item.href)}
                >
                  <item.icon className="mr-2 size-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
            <Separator className="my-2" />
            <nav className="flex flex-col gap-1">
              <Button
                variant={location.pathname.startsWith(settingsNavItem.href) ? "secondary" : "ghost"}
                className="justify-start w-full"
                onClick={() => handleNavigate(settingsNavItem.href)}
              >
                <settingsNavItem.icon className="mr-2 size-4" />
                {settingsNavItem.label}
              </Button>
              <Button
                variant="ghost"
                className="justify-start w-full text-red-500 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 size-4" />
                Sign Out
              </Button>
            </nav>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};