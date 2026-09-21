import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, GripVertical, Play, ShieldAlert, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/orbi/PageHeader";
import { RightsBadge } from "@/components/orbi/RightsBadge";
import { AssetDetailDialog } from "@/components/orbi/AssetDetailDialog";
import { formatDuration, formatLongDuration, getCategory } from "@/lib/nasa";
import type { NasaAsset } from "@/lib/nasa/types";
import { evaluateRights } from "@/lib/rights/rights";
import { orbiStore, useOrbiState, useProgram } from "@/lib/programming/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title: "Programação — ORBI Broadcast Control" },
      {
        name: "description",
        content: "Sequenciamento da programação com reordenação, duração total e checagem de direitos.",
      },
      { property: "og:title", content: "Programação — ORBI Broadcast Control" },
      {
        property: "og:description",
        content: "Monte a sequência de exibição dos conteúdos NASA antes da transmissão.",
      },
    ],
  }),
  component: ProgramPage,
});

function ProgramPage() {
  const { items, totalDuration, rights } = useProgram();
  const { settings } = useOrbiState();
  const [name, setName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<NasaAsset | null>(null);

  function handleDrop(target: number) {
    if (dragIndex !== null) orbiStore.moveItem(dragIndex, target);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Programação"
        title="Sequência de exibição"
        description="Arraste para reordenar. A duração total e a checagem de direitos são recalculadas automaticamente."
        actions={
          <>
            <Button
              variant="ghost"
              disabled={items.length === 0}
              onClick={() => {
                orbiStore.clearProgram();
                toast.success("Programação limpa");
              }}
            >
              <Trash2 className="h-4 w-4" /> Limpar programação
            </Button>
            <Button
              disabled={items.length === 0}
              onClick={() => {
                const saved = orbiStore.saveProgram(name || settings.programTitle);
                setName("");
                toast.success("Programação salva", { description: saved.name });
              }}
            >
              Salvar programação
            </Button>
          </>
        }
      />

      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum item na programação. Selecione conteúdos no catálogo.
              </p>
              <Button asChild variant="ghost" className="mt-3">
                <Link to="/">Ir para o catálogo</Link>
              </Button>
            </div>
          )}

          {items.map((entry, index) => {
            const decision = evaluateRights(entry.asset);
            const needsAck = decision.requiresAcknowledgement && !entry.acknowledgedReview;
            return (
              <div
                key={entry.item.uid}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex((i) => (i === index ? null : i))}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition-all duration-200",
                  dragIndex === index && "opacity-50",
                  overIndex === index && dragIndex !== index && "border-primary/60 translate-y-0.5",
                )}
              >
                <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                <span className="font-mono text-sm text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <img
                  src={entry.asset.thumbnailUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="hidden h-12 w-20 rounded object-cover sm:block"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{entry.asset.title}</p>
                  <p className="label-caps mt-1 flex flex-wrap gap-2 text-muted-foreground">
                    <span>{getCategory(entry.asset.category)?.label}</span>
                    <span>{formatDuration(entry.asset.duration)}</span>
                    <span>{entry.asset.resolution}</span>
                    <span>{entry.asset.fps} FPS</span>
                  </p>
                </div>
                <RightsBadge status={decision.status} className="hidden sm:inline-flex" />
                {needsAck && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-warning"
                    onClick={() => {
                      orbiStore.acknowledgeItem(entry.item.uid);
                      toast.success("Revisão confirmada");
                    }}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" /> Confirmar revisão
                  </Button>
                )}
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setPreview(entry.asset)}>
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => orbiStore.duplicateItem(entry.item.uid)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => orbiStore.removeFromProgram(entry.item.uid)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="label-caps text-muted-foreground">Resumo</h2>
            <dl className="mt-3 space-y-3">
              <Row label="Itens" value={String(items.length).padStart(2, "0")} />
              <Row label="Duração total" value={formatLongDuration(totalDuration)} mono />
              <Row label="Liberados" value={String(rights.ok)} tone="ok" />
              <Row label="Em revisão" value={String(rights.review)} tone="warn" />
              <Row label="Bloqueados" value={String(rights.blocked)} tone="bad" />
            </dl>
            <p
              className={cn(
                "mt-4 rounded-md border p-3 text-xs",
                rights.clear
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning",
              )}
            >
              {rights.clear
                ? "Checagem de direitos concluída. Programação apta à transmissão."
                : `Pendências de direitos: ${rights.blocked} bloqueado(s), ${rights.pendingAcknowledgement} aguardando confirmação.`}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="label-caps text-muted-foreground">Nome da programação</h2>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={settings.programTitle}
              className="mt-3 border-border bg-background"
            />
            <Button asChild variant="ghost" className="mt-3 w-full">
              <Link to="/broadcast">Ir para transmissão</Link>
            </Button>
          </div>
        </aside>
      </div>

      <AssetDetailDialog
        asset={preview}
        open={preview !== null}
        onOpenChange={(v) => !v && setPreview(null)}
        onAdd={(asset) => {
          orbiStore.addToProgram(asset.id, true);
          setPreview(null);
          toast.success("Adicionado à programação", { description: asset.title });
        }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm font-semibold text-foreground",
          mono && "font-mono",
          tone === "ok" && "text-success",
          tone === "warn" && "text-warning",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
