import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard, Building2, Users, FileCheck } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface font-sans selection:bg-primary/20">
      
      {/* Sidebar - Tonal Layering (No solid borders) */}
      <aside className="w-72 flex-shrink-0 bg-surface-container-low flex flex-col pt-8">
        <div className="px-8 pb-8 flex items-center gap-3">
           <span className="text-xl font-heading font-medium text-on-surface tracking-tight">Nyumbani<span className="opacity-40">Ops</span></span>
        </div>

        <div className="px-6 pb-6">
          <OrganizationSwitcher 
            hidePersonal={true}
            appearance={{
              elements: {
                organizationSwitcherTrigger: "font-sans text-on-surface font-medium w-full text-left bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 rounded-lg p-3 h-12 transition-colors shadow-[0_4px_12px_rgba(28,28,24,0.02)]",
                organizationPreviewMainIdentifier: "text-on-surface font-semibold text-sm",
              }
            }}
          />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-4 px-4">Workspace</p>
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-semibold text-primary bg-surface-container rounded-lg transition-colors group">
            <LayoutDashboard className="mr-4 h-4 w-4" />
            Control Panel
          </Link>
          <Link href="/properties" className="flex items-center px-4 py-3 text-sm font-medium text-on-surface-variant rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors group">
            <Building2 className="mr-4 h-4 w-4 text-outline group-hover:text-primary transition-colors" />
            Properties
          </Link>
          <Link href="/staff" className="flex items-center px-4 py-3 text-sm font-medium text-on-surface-variant rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors group">
            <Users className="mr-4 h-4 w-4 text-outline group-hover:text-primary transition-colors" />
            Orchestration
          </Link>
          <Link href="/compliance" className="flex items-center px-4 py-3 text-sm font-medium text-on-surface-variant rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors group">
            <FileCheck className="mr-4 h-4 w-4 text-outline group-hover:text-primary transition-colors" />
            Compliance
          </Link>
        </nav>

        <div className="p-6 bg-surface-container flex items-center justify-between rounded-tr-[40px] mt-auto">
          <UserButton 
            appearance={{
                elements: {
                  userButtonOuterIdentifier: "text-on-surface font-semibold text-sm",
                }
              }}
            showName 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex-1 overflow-y-auto p-12 lg:p-16 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
