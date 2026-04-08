"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, FileCheck, HandCoins, ReceiptText, Zap, Globe, CalendarDays } from "lucide-react";

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const links = [
    { name: "Control Panel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Storefront", href: "/demo/book", icon: Globe },
    { name: "Owners", href: "/owners", icon: HandCoins },
    { name: "Reservations", href: "/reservations/new", icon: CalendarDays },
    { name: "Statements", href: "/statements", icon: ReceiptText },
    { name: "Team", href: "/staff", icon: Users },
    { name: "Taxes", href: "/compliance", icon: FileCheck },
    { name: "Utilities", href: "/kplc", icon: Zap },
  ];

  return (
    <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? "px-2" : "px-4"}`}>
      {!collapsed && (
        <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-4 px-4">
          Workspace
        </p>
      )}
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? link.name : undefined}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
              isActive
                ? "text-primary bg-surface-container font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <Icon
              className={`h-4 w-4 transition-colors ${
                isActive ? "text-primary" : "text-outline group-hover:text-primary"
              } ${collapsed ? "" : "mr-4"}`}
            />
            {!collapsed && link.name}
          </Link>
        );
      })}
    </nav>
  );
}
