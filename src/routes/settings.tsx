import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/orbi/PageHeader";
import { orbiStore, useOrbiState } from "@/lib/programming/store";
import { DEFAULT_ENCODER_PROFILE } from "@/lib/broadcast/broadcastEngine";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — ORBI Broadcast Control" },
      {
        name: "description",
        content: "Configurações da estação, perfil de encoder e estado das integrações.",
      },
      { property: "og:title", content: "Configurações — ORBI Broadcast Control" },
      {
        property: "og:description",
        content: "Ajuste identidade do canal, perfil técnico e integrações da estação ORBI.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings } = useOrbiState();

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Configurações"
        title="Estação e integrações"
        description="Preferências salvas localmente neste navegador. Credenciais de transmissão nunca ficam no frontend."
      />

      <div className="grid max-w-4xl gap-6 px-6 py-8">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="label-caps text-muted-foreground">Identidade</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="channel">Nome do canal</Label>
              <Input
                id="channel"
                value={settings.channelName}
                placeholder="ORBI LIVE STATION"
                onChange={(e) => orbiStore.updateSettings({ channelName: e.target.value })}
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Título padrão da programação</Label>
              <Input
                id="program"
                value={settings.programTitle}
                onChange={(e) => orbiStore.updateSettings({ programTitle: e.target.value })}
                className="border-border bg-background"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm text-foreground">Loop contínuo da programação</p>
              <p className="text-xs text-muted-foreground">
                Reinicia a sequência automaticamente ao final do último item.
              </p>
            </div>
            <Switch
              checked={settings.autoLoop}
              onCheckedChange={(v) => orbiStore.updateSettings({ autoLoop: v })}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="label-caps text-muted-foreground">Perfil do encoder</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="res">Resolução de saída</Label>
              <select
                id="res"
                value={settings.encoderResolution}
                onChange={(e) =>
                  orbiStore.updateSettings({
                    encoderResolution: e.target.value as typeof settings.encoderResolution,
                  })
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="1920x1080">1920x1080</option>
                <option value="2560x1440">2560x1440</option>
                <option value="3840x2160">3840x2160</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fps">FPS</Label>
              <select
                id="fps"
                value={settings.encoderFps}
                onChange={(e) =>
                  orbiStore.updateSettings({ encoderFps: Number(e.target.value) as 30 | 60 })
                }
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>
          <p className="label-caps mt-4 border-t border-border pt-4 text-muted-foreground">
            Codec {DEFAULT_ENCODER_PROFILE.codec} · vídeo {DEFAULT_ENCODER_PROFILE.videoBitrateKbps} kbps ·
            áudio {DEFAULT_ENCODER_PROFILE.audioBitrateKbps} kbps · keyframe{" "}
            {DEFAULT_ENCODER_PROFILE.keyframeIntervalSeconds}s
          </p>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="label-caps text-muted-foreground">Integrações</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-foreground">YouTube Live</span>
              <span className="label-caps text-warning">NÃO CONFIGURADO</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-foreground">Broadcast Engine (FFmpeg / RTMPS)</span>
              <span className="label-caps text-muted-foreground">NÃO CONFIGURADO</span>
            </div>
          </div>
          <p className="mt-4 flex gap-2 rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Chaves de API e stream keys serão armazenadas exclusivamente no servidor em etapa posterior.
            Nenhuma credencial é gravada neste navegador.
          </p>
        </section>
      </div>
    </div>
  );
}
