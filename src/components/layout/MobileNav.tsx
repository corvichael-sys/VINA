import { useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { mainNavItems, settingsNavItem, NavItem } from "@/config/nav"; // Import NavItem type

export const MobileNav = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (href: string) => {
    navigate(href);
    setOpenMobile(false); // Close menu on navigation
  };

  return (
    <div className="md:hidden">
      <Collapsible open={openMobile} onOpenChange={setOpenMobile}>
        <CollapsibleContent className="overflow-hidden bg-background data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="flex flex-col gap-2 border-b p-4">
            <nav className="flex flex-col gap-1">
              {mainNavItems.map((item: NavItem) => ( // Explicitly type item as NavItem
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
            <Separator className="my-2" /> {/* Replaced hr with Separator */}
            <nav>
              <Button
                variant={location.pathname.startsWith(settingsNavItem.href) ? "secondary" : "ghost"}
                className="justify-start w-full"
                onClick={() => handleNavigate(settingsNavItem.href)}
              >
                <settingsNavItem.icon className="mr-2 size-4" />
                {settingsNavItem.label}
              </Button>
            </nav>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};