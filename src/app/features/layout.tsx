'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHub = pathname === '/features';

  const subLinks = [
    { label: "Utility Assurance", href: "/features/kplc-integration" },
    { label: "Dynamic Access", href: "/features/ttlock-automation" },
    { label: "Financial Ecosystem", href: "/features/etims-compliance" },
    { label: "Staff Orchestration", href: "/features/staff-orchestration" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      {/* Sub Navigation - Only show on sub-pages or style differently for hub */}
      {!isHub && (
        <nav className="fixed top-24 w-full z-40 px-6 hidden md:block">
          <div className="max-w-[1440px] mx-auto">
            <div className="bg-surface/80 backdrop-blur-xl border border-surface-dim rounded-full px-8 h-12 flex items-center justify-start gap-8 shadow-sm">
              <Link href="/features" className="text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-primary uppercase transition-colors mr-4 border-r border-surface-dim pr-8">
                All Features
              </Link>
              {subLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`text-[10px] font-bold tracking-widest uppercase transition-all duration-300 hover:text-primary 
                      ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Content wrapper with dynamic padding offset */}
      <div className={`${!isHub ? 'pt-40' : 'pt-0'} flex-1 flex flex-col`}>
        {children}
      </div>
    </div>
  );
}
