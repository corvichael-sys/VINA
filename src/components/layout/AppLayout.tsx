import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Landmark, Wallet, PieChart, Calendar, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/debts", label: "Debts", icon: Landmark },
  { href: "/paychecks", label: "Paychecks", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/payment-plans", label: "Payment Plans", icon: Calendar },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

export const AppLayout = () => {
  const { profile, logout } = useSession();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="">Debt Destroyer</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => <NavLink key={item.href} {...item} />)}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* Mobile Nav Trigger can be added here */}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{profile?.username || 'User'}</span>
            <Avatar className="h-9 w-9">
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <Button onClick={logout} variant="outline" size="sm">Sign Out</Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};