import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ListPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/orbi/PageHeader";
import { formatLongDuration } from "@/lib/nasa";
import { orbiStore, useOrbiState } from "@/lib/programming/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Histórico — ORBI Broadcast Control" },
      {
        name: "description",
        content: "Programações salvas e histórico de transmissões da estação ORBI.",
      },
      { property: "og:title", content: "Histórico — ORBI Broadcast Control" },
      {
        property: "og:description",
        content: "Recupere programações salvas e reaproveite sequências já validadas.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history } = useOrbiState();

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Histórico"
        title="Programações salvas"
        description="Sequências salvas localmente nesta estação. Carregue uma programação para editá-la novamente."
      />

      <div className="space-y-2 px-6 py-8">
        {history.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma programação salva ainda.
          </div>
        )}
        {history.map((program) => (
          <div
            key={program.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{program.name}</p>
              <p className="label-caps mt-1 flex gap-3 text-muted-foreground">
                <span>{new Date(program.createdAt).toLocaleString("pt-BR")}</span>
                <span>{String(program.items.length).padStart(2, "0")} itens</span>
                <span className="font-mono">{formatLongDuration(program.totalDuration)}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                orbiStore.loadProgram(program.id);
                toast.success("Programação carregada", { description: program.name });
              }}
            >
              <ListPlus className="h-3.5 w-3.5" /> Carregar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => orbiStore.deleteProgram(program.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
