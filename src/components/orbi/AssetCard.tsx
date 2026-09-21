import { Info, Play, Plus, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RightsBadge } from "./RightsBadge";
import { formatDuration, getCategory } from "@/lib/nasa";
import type { NasaAsset } from "@/lib/nasa/types";
import { evaluateRights } from "@/lib/rights/rights";

export function AssetCard({
  asset,
  onPreview,
  onDetails,
  onAdd,
}: {
  asset: NasaAsset;
  onPreview: () => void;
  onDetails: () => void;
  onAdd: () => void;
}) {
  const rights = evaluateRights(asset);
  const category = getCategory(asset.category);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-strong">
      <button
        type="button"
        onClick={onPreview}
        className="relative aspect-video overflow-hidden bg-black/50 text-left"
      >
        <img
          src={asset.thumbnailUrl}
          alt={asset.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-9 w-9 text-foreground" />
        </span>
        <span className="label-caps absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-foreground">
          {formatDuration(asset.duration)}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="label-caps text-muted-foreground">
            {category?.icon} {category?.label}
          </span>
          <RightsBadge status={rights.status} />
        </div>
        <h3 className="mt-2 text-base leading-snug font-semibold text-foreground">{asset.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{asset.description}</p>

        <div className="label-caps mt-3 flex gap-3 text-muted-foreground">
          <span>{asset.resolution}</span>
          <span>{asset.fps} FPS</span>
          <span>{asset.format}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Play className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={onDetails}>
            <Info className="h-3.5 w-3.5" /> Detalhes
          </Button>
          <Button
            size="sm"
            className="ml-auto"
            disabled={!rights.canAddToProgram}
            title={rights.canAddToProgram ? undefined : rights.reason}
            onClick={onAdd}
          >
            {rights.canAddToProgram ? <Plus className="h-3.5 w-3.5" /> : <ShieldX className="h-3.5 w-3.5" />}
            {rights.canAddToProgram ? "Programar" : "Bloqueado"}
          </Button>
        </div>
        {!rights.canAddToProgram && (
          <p className="mt-2 text-xs text-destructive">{rights.reason}</p>
        )}
      </div>
    </article>
  );
}
