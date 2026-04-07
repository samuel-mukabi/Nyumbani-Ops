"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, FileCheck } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { name: "Control Panel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Team", href: "/staff", icon: Users },
    { name: "Taxes", href: "/compliance", icon: FileCheck },
  ];

  return (
    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-4 px-4">Workspace</p>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
              isActive
                ? "text-primary bg-surface-container font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Icon
              className={`mr-4 h-4 w-4 transition-colors ${
                isActive ? "text-primary" : "text-outline group-hover:text-primary"
              }`}
            />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
