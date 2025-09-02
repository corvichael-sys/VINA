import { PiggyBank, Wallet, PieChart, Calendar, ListChecks, Settings } from "lucide-react";
import { LucideIcon } from "lucide-react"; // Import LucideIcon type

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon; // Use LucideIcon type for icons
};

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: PiggyBank },
  { href: "/paychecks", label: "Paychecks", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/payment-plans", label: "Payment Plans", icon: Calendar },
];

export const settingsNavItem: NavItem = { href: "/settings", label: "Settings", icon: Settings };