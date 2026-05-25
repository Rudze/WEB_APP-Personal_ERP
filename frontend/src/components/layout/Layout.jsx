import { useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const matches = useMatches();
  const title = matches.findLast((m) => m.handle?.title)?.handle?.title || "Personal ERP";

  return (
    /* Fond smoky-black comme le portfolio */
    <div
      className="flex h-screen overflow-hidden gap-4 p-4"
      style={{ background: "hsl(0,0%,7%)" }}
    >
      {/* Sidebar flottante — carte portfolio */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Zone principale — carte portfolio */}
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
