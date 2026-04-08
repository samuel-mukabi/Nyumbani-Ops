"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, LogOut, Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/layout/SidebarNav";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 420;
const SIDEBAR_DEFAULT = 288;
const SIDEBAR_COLLAPSED = 84;

type DashboardShellProps = {
  children: React.ReactNode;
  orgName: string;
  userDisplayName: string;
  userInitial: string;
};

export function DashboardShell({
  children,
  orgName,
  userDisplayName,
  userInitial,
}: DashboardShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [collapsed, setCollapsed] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);

  useEffect(() => {
    const storedWidth = window.localStorage.getItem("sidebar:width");
    const storedCollapsed = window.localStorage.getItem("sidebar:collapsed");
    const shortcutHintSeen = window.localStorage.getItem("sidebar:shortcut-hint-seen");
    if (storedWidth) {
      const width = Number(storedWidth);
      if (!Number.isNaN(width)) {
        setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, width)));
      }
    }
    if (storedCollapsed === "1") {
      setCollapsed(true);
    }
    if (shortcutHintSeen !== "1") {
      setShowShortcutHint(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sidebar:width", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    window.localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (!showShortcutHint) return;
    const timeout = window.setTimeout(() => {
      setShowShortcutHint(false);
      window.localStorage.setItem("sidebar:shortcut-hint-seen", "1");
    }, 9000);
    return () => window.clearTimeout(timeout);
  }, [showShortcutHint]);

  const dismissShortcutHint = () => {
    setShowShortcutHint(false);
    window.localStorage.setItem("sidebar:shortcut-hint-seen", "1");
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;
      if (isTypingTarget || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "[") {
        event.preventDefault();
        if (isMobile) setMobileOpen(false);
        setCollapsed(true);
      }
      if (event.key === "]") {
        event.preventDefault();
        if (isMobile) setMobileOpen(true);
        setCollapsed(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile]);

  useEffect(() => {
    if (!resizing || collapsed) return;
    const onMove = (event: MouseEvent) => {
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, event.clientX)));
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, collapsed]);

  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED : sidebarWidth;
  const mobileSidebarWidth = Math.min(sidebarWidth, 360);
  const shouldShowSidebar = !isMobile || mobileOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface font-sans selection:bg-primary/20">
      {isMobile && mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`relative z-40 flex-shrink-0 bg-surface-container-low flex flex-col pt-8 transition-all duration-200 ${
          isMobile
            ? `fixed left-0 top-0 h-screen ${shouldShowSidebar ? "translate-x-0" : "-translate-x-full"}`
            : "translate-x-0"
        }`}
        style={{ width: isMobile ? mobileSidebarWidth : effectiveWidth }}
      >
        <div className={`pb-8 flex items-center gap-3 ${collapsed ? "px-4 justify-center" : "px-8"}`}>
          <span className="text-xl font-heading font-medium text-on-surface tracking-tight">
            {collapsed ? "NO" : <>Nyumbani<span className="opacity-40">Ops</span></>}
          </span>
        </div>

        <div className={`${collapsed ? "px-2 pb-4" : "px-6 pb-6"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`font-sans text-on-surface font-medium w-full text-left bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 h-12 transition-colors shadow-[0_4px_12px_rgba(28,28,24,0.02)] flex items-center justify-between hover:bg-surface-container-low focus:outline-none ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              {collapsed ? (
                <span className="text-xs font-semibold">{userInitial}</span>
              ) : (
                <>
                  <span className="text-sm font-semibold truncate">{orgName}</span>
                  <span className="text-[10px] text-primary italic font-serif">Pro</span>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[228px] bg-surface-container-lowest border-outline-variant/20 rounded-xl shadow-xl p-1">
              <DropdownMenuItem className="text-sm font-semibold rounded-lg focus:bg-surface-container-low cursor-default">
                {orgName}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-outline-variant/20 my-1" />
              <Link href="/onboarding" className="block w-full">
                <DropdownMenuItem className="text-sm text-primary font-bold focus:bg-primary/10 rounded-lg cursor-pointer transition-colors">
                  + Create Workspace
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarNav collapsed={collapsed} />

        <div className={`bg-surface-container flex flex-col gap-4 mt-auto ${collapsed ? "p-3" : "p-6"} ${collapsed ? "" : "rounded-tr-[40px]"}`}>
          <div className={`flex items-center group ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
            <Link href="/settings" className={`flex items-center hover:opacity-80 transition-opacity ${collapsed ? "" : "gap-3 flex-1"}`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary/20 transition-colors uppercase">
                {userInitial}
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate max-w-[120px]">{userDisplayName}</span>
                  <span className="text-[10px] text-on-surface-variant group-hover:text-primary transition-colors">Edit Profile</span>
                </div>
              )}
            </Link>
            {!collapsed && (
              <form action="/auth/sign-out" method="post" className="ml-auto">
                <button type="submit" className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-2 z-20">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>

        {showShortcutHint && !isMobile && (
          <div className="absolute top-14 right-3 z-20 rounded-lg border border-outline-variant/30 bg-background/95 px-3 py-2 shadow-md backdrop-blur">
            <div className="flex items-start gap-3">
              <p className="text-xs text-on-surface-variant whitespace-nowrap">
                Quick shortcut: <span className="font-semibold text-on-surface">[</span> collapse,{" "}
                <span className="font-semibold text-on-surface">]</span> expand
              </p>
              <button
                type="button"
                onClick={dismissShortcutHint}
                className="text-on-surface-variant/70 hover:text-on-surface transition-colors"
                aria-label="Dismiss shortcut hint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {!collapsed && (
          <div
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors"
            onMouseDown={() => setResizing(true)}
            onDoubleClick={() => {
              setCollapsed(false);
              setSidebarWidth(SIDEBAR_DEFAULT);
            }}
            aria-hidden="true"
          />
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/3 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/3 blur-[120px] rounded-full pointer-events-none" />

        {isMobile && (
          <div className="absolute left-4 top-4 z-20">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMobileOpen((value) => !value)}
              title="Toggle sidebar"
            >
              {mobileOpen ? <PanelLeftClose className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-16 lg:px-24 lg:py-24 relative z-10">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
