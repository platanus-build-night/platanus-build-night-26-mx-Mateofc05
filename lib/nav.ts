import { LayoutDashboard, Users, Send, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Atletas", href: "/athletes", icon: Users },
  { label: "Contacto", href: "/outreach", icon: Send },
];
