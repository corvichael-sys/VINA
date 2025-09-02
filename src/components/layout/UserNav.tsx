import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";
import { mainNavItems, settingsNavItem, NavItem } from "@/config/nav";
import { ChevronDown, LogOut } from "lucide-react";

export const UserNav = () => {
  const { profile, logout } = useSession();
  const navigate = useNavigate();

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <span>{profile?.username || 'Menu'}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mainNavItems.map((item: NavItem) => (
          <DropdownMenuItem key={item.href} onClick={() => handleNavigate(item.href)}>
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigate(settingsNavItem.href)}>
          <settingsNavItem.icon className="mr-2 h-4 w-4" />
          <span>{settingsNavItem.label}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};