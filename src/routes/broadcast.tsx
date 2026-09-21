import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Radio, Youtube, Play, SkipForward, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/orbi/PageHeader";
import { StatusPill } from "@/components/orbi/StatusPill";
import { formatLongDuration } from "@/lib/nasa";
import { useProgram } from "@/lib/programming/store";
import { youtubeService, type YoutubeStatus } from "@/lib/youtube/youtubeService";
import { broadcastEngine, type EngineState } from "@/lib/broadcast/broadcastEngine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/broadcast")({
  head: () => ({
    meta: [
      { title: "Transmissão — ORBI Broadcast Control" },
      {
        name: "description",
        content: "Painel de controle de transmissão: estado do broadcast, YouTube e encoder.",
      },
      { property: "og:title", content: "Transmissão — ORBI Broadcast Control" },
      {
        property: "og:description",
        content: "Verifique pré-requisitos e acione a transmissão da programação ORBI.",
      },
    ],
  }),
  component: BroadcastPage,
});

function BroadcastPage() {
  const { items, totalDuration, rights } = useProgram();
  const [youtube, setYoutube] = useState<YoutubeStatus | null>(null);
  const [engine, setEngine] = useState<EngineState | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void youtubeService.getStatus().then(setYoutube);
    void broadcastEngine.getState().then(setEngine);
  }, []);

  const youtubeConnected = youtube?.status === "CONNECTED";
  const encoderReady = engine?.status === "IDLE" || engine?.status === "ENCODING";
  const state = items.length > 0 && rights.clear && youtubeConnected && encoderReady ? "READY" : "OFFLINE";

  const blockers: string[] = [];
  if (items.length === 0) blockers.push("Programação vazia — adicione conteúdos no catálogo.");
  if (rights.blocked > 0) blockers.push(`${rights.blocked} item(ns) bloqueado(s) por direitos.`);
  if (rights.pendingAcknowledgement > 0)
    blockers.push(`${rights.pendingAcknowledgement} item(ns) aguardando confirmação de revisão.`);
  if (!youtubeConnected) blockers.push("Canal do YouTube não conectado.");
  if (!encoderReady) blockers.push("Encoder não configurado.");

  const current = playingIndex !== null ? items[playingIndex] : null;

  useEffect(() => {
    if (current && videoRef.current) {
      videoRef.current.load();
      void videoRef.current.play().catch(() => undefined);
    }
  }, [current?.item.uid]);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Transmissão"
        title="Painel de controle"
        description="Estado operacional da estação, pré-requisitos de transmissão e pré-visualização sequencial da programação."
        actions={
          <StatusPill
            label="Broadcast"
            value={state}
            tone={state === "READY" ? "ok" : "neutral"}
            className="h-9"
          />
        }
      />

      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-black/60">
            {current ? (
              <video
                ref={videoRef}
                src={current.asset.mediaUrl}
                poster={current.asset.thumbnailUrl}
                controls
                playsInline
                onEnded={() =>
                  setPlayingIndex((i) => (i !== null && i + 1 < items.length ? i + 1 : null))
                }
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Radio className="h-8 w-8" />
                <span className="label-caps">Sem sinal — pré-visualização inativa</span>
              </div>
            )}
          </div>

          {current && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="font-mono text-sm text-accent">
                {String((playingIndex ?? 0) + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">{current.asset.title}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setPlayingIndex((i) => (i !== null && i + 1 < items.length ? i + 1 : null))
                }
              >
                <SkipForward className="h-3.5 w-3.5" /> Próximo
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={items.length === 0}
              onClick={() => setPlayingIndex(0)}
              variant="secondary"
            >
              <Play className="h-4 w-4" /> Visualizar programação
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const status = await youtubeService.connect();
                setYoutube(status);
                toast.warning("YouTube não configurado", { description: status.message });
              }}
            >
              <Youtube className="h-4 w-4" /> Conectar YouTube
            </Button>
            <Button
              disabled={blockers.length > 0}
              onClick={async () => {
                const plan = await broadcastEngine.buildRenderPlan(items.map((i) => i.item));
                const next = await broadcastEngine.start(plan);
                setEngine(next);
                toast.info(next.message);
              }}
            >
              <Radio className="h-4 w-4" /> Iniciar transmissão
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="label-caps text-muted-foreground">Leitura do sistema</h2>
            <dl className="mt-3 space-y-3">
              <Row label="Itens na programação" value={String(items.length).padStart(2, "0")} />
              <Row label="Duração" value={formatLongDuration(totalDuration)} mono />
              <Row
                label="YouTube"
                value={youtube ? youtube.status.replace("_", " ") : "—"}
                tone={youtubeConnected ? "ok" : "warn"}
              />
              <Row
                label="Encoder"
                value={engine ? engine.status.replace("_", " ") : "—"}
                tone={encoderReady ? "ok" : "warn"}
              />
              <Row
                label="Direitos"
                value={rights.clear ? "OK" : "PENDENTE"}
                tone={rights.clear ? "ok" : "bad"}
              />
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="label-caps text-muted-foreground">Pré-requisitos</h2>
            {blockers.length === 0 ? (
              <p className="mt-3 text-sm text-success">
                Todos os pré-requisitos atendidos. Transmissão liberada.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {blockers.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-warning">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="ghost" className="mt-4 w-full">
              <Link to="/program">Abrir programação</Link>
            </Button>
          </div>
        </aside>
      </div>
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
    <div className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
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
