import { cn } from "@/lib/utils";
import type { RightsStatus } from "@/lib/nasa/types";

const MAP: Record<RightsStatus, { label: string; className: string }> = {
  broadcast_ok: {
    label: "BROADCAST OK",
    className: "border-success/40 bg-success/10 text-success",
  },
  review: { label: "REVIEW", className: "border-warning/40 bg-warning/10 text-warning" },
  blocked: {
    label: "BLOQUEADO",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

export function RightsBadge({ status, className }: { status: RightsStatus; className?: string }) {
  const item = MAP[status];
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center rounded-full border px-2 py-0.5 font-semibold",
        item.className,
        className,
      )}
    >
      {item.label}
    </span>
  );
}
