import { useState } from "react";
import { Check, Plus, ShieldAlert, ShieldX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RightsBadge } from "./RightsBadge";
import { getCategory, formatDuration } from "@/lib/nasa";
import type { NasaAsset } from "@/lib/nasa/types";
import { evaluateRights } from "@/lib/rights/rights";

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border py-2.5">
      <div className="label-caps text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

export function AssetDetailDialog({
  asset,
  open,
  onOpenChange,
  onAdd,
}: {
  asset: NasaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (asset: NasaAsset, acknowledged: boolean) => void;
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!asset) return null;
  const rights = evaluateRights(asset);
  const category = getCategory(asset.category);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setAcknowledged(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-5xl border-border bg-surface p-0">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="bg-black/60">
            <video
              key={asset.id}
              src={asset.mediaUrl}
              poster={asset.thumbnailUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-tl-lg object-cover"
            />
          </div>
          <div className="max-h-[80vh] overflow-y-auto p-6">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="label-caps text-muted-foreground">
                  {category?.icon} {category?.label}
                </span>
                <RightsBadge status={rights.status} />
              </div>
              <DialogTitle className="text-xl leading-snug">{asset.title}</DialogTitle>
            </DialogHeader>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{asset.description}</p>

            <div className="mt-6">
              <h3 className="label-caps text-muted-foreground">Especificações técnicas</h3>
              <div className="mt-2 grid grid-cols-2 gap-x-6">
                <Spec label="Duração" value={formatDuration(asset.duration)} />
                <Spec label="Resolução" value={asset.resolution} />
                <Spec label="FPS" value={String(asset.fps)} />
                <Spec label="Formato" value={asset.format} />
                <Spec label="Áudio" value={asset.audioStatus} />
                <Spec label="Prioridade" value={`P${asset.broadcastPriority}`} />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="label-caps text-muted-foreground">Direitos</h3>
              <div className="mt-2 grid grid-cols-2 gap-x-6">
                <Spec label="Fonte" value={asset.source} />
                <Spec label="Transmissão" value={asset.broadcastAllowed ? "Permitida" : "Negada"} />
                <Spec label="YouTube" value={asset.youtubeAllowed.toUpperCase()} />
                <Spec label="Uso comercial" value={asset.commercialUse ? "Sim" : "Não"} />
                <Spec label="Terceiros" value={asset.thirdPartyContent ? "Sim" : "Não"} />
                <Spec label="ORBI Web" value={asset.orbiWeb ? "Liberado" : "Restrito"} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{asset.notes}</p>
              <a
                href={asset.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
              >
                Abrir página oficial da fonte
              </a>
            </div>

            {rights.status === "blocked" && (
              <div className="mt-6 flex gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <ShieldX className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{rights.reason}</span>
              </div>
            )}

            {rights.requiresAcknowledgement && (
              <label className="mt-6 flex cursor-pointer gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1">
                  {rights.reason}
                  <span className="mt-2 flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="h-4 w-4 accent-[var(--warning)]"
                    />
                    Confirmo a revisão de direitos deste conteúdo
                  </span>
                </span>
              </label>
            )}

            <Button
              className="mt-6 w-full"
              disabled={!rights.canAddToProgram || (rights.requiresAcknowledgement && !acknowledged)}
              onClick={() => onAdd(asset, acknowledged)}
            >
              {rights.canAddToProgram ? (
                <>
                  <Plus className="h-4 w-4" /> Adicionar à programação
                </>
              ) : (
                <>
                  <ShieldX className="h-4 w-4" /> Bloqueado para transmissão
                </>
              )}
            </Button>
            {rights.status === "broadcast_ok" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
                <Check className="h-3.5 w-3.5" /> {rights.reason}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
