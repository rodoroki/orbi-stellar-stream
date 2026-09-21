import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "ok" | "warn" | "live";

const TONE: Record<Tone, { dot: string; text: string }> = {
  neutral: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
  info: { dot: "bg-primary", text: "text-primary" },
  ok: { dot: "bg-success", text: "text-success" },
  warn: { dot: "bg-warning", text: "text-warning" },
  live: { dot: "bg-live pulse-live", text: "text-live" },
};

export function StatusPill({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      <span className="label-caps text-muted-foreground">{label}</span>
      <span className={cn("label-caps font-semibold", t.text)}>{value}</span>
    </div>
  );
}
