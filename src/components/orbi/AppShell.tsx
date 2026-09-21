import { Link } from "@tanstack/react-router";
import { Library, ListOrdered, Radio, History, Settings, Satellite } from "lucide-react";
import type { ReactNode } from "react";
import { StatusPill } from "./StatusPill";
import { useProgram, useOrbiState } from "@/lib/programming/store";
import { t } from "@/lib/i18n/strings";

const NAV = [
  { to: "/", label: t("nav.catalog"), icon: Library },
  { to: "/program", label: t("nav.program"), icon: ListOrdered },
  { to: "/broadcast", label: t("nav.broadcast"), icon: Radio },
  { to: "/history", label: t("nav.history"), icon: History },
  { to: "/settings", label: t("nav.settings"), icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const program = useProgram();
  const { history } = useOrbiState();
  const broadcastState = program.items.length > 0 && program.rights.clear ? "READY" : "OFFLINE";

  return (
    <div className="station-grid min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex flex-wrap items-center gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <Satellite className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-semibold tracking-[0.18em] text-foreground">
              ORBI BROADCAST CONTROL
            </span>
          </Link>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <StatusPill
              label={t("status.broadcast")}
              value={broadcastState}
              tone={broadcastState === "READY" ? "ok" : "neutral"}
            />
            <StatusPill label={t("status.youtube")} value="NÃO CONFIGURADO" tone="warn" />
            <StatusPill label={t("status.encoder")} value="NÃO CONFIGURADO" tone="neutral" />
            <Link
              to="/settings"
              className="rounded-md border border-border bg-surface p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("nav.settings")}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-61px)] flex-col md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-sidebar p-3 md:w-60 md:flex-col md:border-b-0 md:border-r">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "bg-sidebar-accent text-foreground border-primary/60",
              }}
              inactiveProps={{ className: "text-muted-foreground border-transparent" }}
              className="label-caps flex items-center gap-2.5 whitespace-nowrap rounded-md border-l-2 px-3 py-2.5 transition-colors hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
              {to === "/program" && program.items.length > 0 && (
                <span className="ml-auto rounded bg-accent/15 px-1.5 text-accent">
                  {String(program.items.length).padStart(2, "0")}
                </span>
              )}
              {to === "/history" && history.length > 0 && (
                <span className="ml-auto text-muted-foreground">{history.length}</span>
              )}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
