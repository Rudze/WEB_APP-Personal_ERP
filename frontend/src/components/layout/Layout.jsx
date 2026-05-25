import { useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminTopNav } from "./AdminTopNav";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";
import { useSettings } from "@/context/SettingsContext";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const matches = useMatches();
  const title = matches.findLast((m) => m.handle?.title)?.handle?.title || "Personal ERP";
  const { navLayout = "vertical" } = useSettings();

  const horizontal = navLayout === "horizontal";

  if (horizontal) {
    return (
      <div
        className="flex flex-col h-screen overflow-hidden gap-3 p-3"
        style={{ background: "hsl(0,0%,7%)" }}
      >
        <AdminTopNav />

        <div
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          style={{
            background: "hsl(240,2%,12%)",
            border: "1px solid hsl(0,0%,22%)",
            borderRadius: "20px",
            boxShadow: "-4px 8px 24px hsla(0,0%,0%,0.25)",
          }}
        >
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        <Toaster />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden gap-3 p-3"
      style={{ background: "hsl(0,0%,7%)" }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{
          background: "hsl(240,2%,12%)",
          border: "1px solid hsl(0,0%,22%)",
          borderRadius: "20px",
          boxShadow: "-4px 8px 24px hsla(0,0%,0%,0.25)",
        }}
      >
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
