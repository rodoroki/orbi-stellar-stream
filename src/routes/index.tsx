import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/orbi/PageHeader";
import { AssetCard } from "@/components/orbi/AssetCard";
import { AssetDetailDialog } from "@/components/orbi/AssetDetailDialog";
import { NASA_CATALOG, NASA_CATEGORIES } from "@/lib/nasa";
import type { NasaAsset } from "@/lib/nasa/types";
import { evaluateRights } from "@/lib/rights/rights";
import { orbiStore } from "@/lib/programming/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Catálogo NASA — ORBI Broadcast Control" },
      {
        name: "description",
        content:
          "Catálogo curado de conteúdos audiovisuais públicos da NASA com verificação de direitos para transmissão.",
      },
      { property: "og:title", content: "Catálogo NASA — ORBI Broadcast Control" },
      {
        property: "og:description",
        content: "Seleção humana de conteúdos NASA liberados para transmissão no YouTube.",
      },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<NasaAsset | null>(null);
  const [open, setOpen] = useState(false);

  const assets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NASA_CATALOG.filter(
      (a) =>
        (category === "all" || a.category === category) &&
        (q === "" ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)),
    ).sort((a, b) => a.broadcastPriority - b.broadcastPriority);
  }, [query, category]);

  function addToProgram(asset: NasaAsset, acknowledged = false) {
    const rights = evaluateRights(asset);
    if (!rights.canAddToProgram) {
      toast.error("Conteúdo bloqueado", { description: rights.reason });
      return;
    }
    if (rights.requiresAcknowledgement && !acknowledged) {
      setSelected(asset);
      setOpen(true);
      toast.warning("Revisão de direitos necessária", { description: rights.reason });
      return;
    }
    orbiStore.addToProgram(asset.id, acknowledged);
    toast.success("Adicionado à programação", { description: asset.title });
    setOpen(false);
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Catálogo"
        title="Conteúdos NASA"
        description="Acervo público curado da NASA. Cada item traz especificações técnicas e verificação de direitos antes de entrar na programação."
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, descrição ou fonte"
          className="h-9 max-w-xs border-border bg-surface"
        />
        <div className="flex flex-wrap gap-1.5">
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="Todos" />
          {NASA_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              label={`${c.icon} ${c.label}`}
            />
          ))}
        </div>
        <span className="label-caps ml-auto text-muted-foreground">{assets.length} itens</span>
      </div>

      <div className="grid gap-5 px-6 py-8 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPreview={() => {
              setSelected(asset);
              setOpen(true);
            }}
            onDetails={() => {
              setSelected(asset);
              setOpen(true);
            }}
            onAdd={() => addToProgram(asset)}
          />
        ))}
        {assets.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum conteúdo encontrado para este filtro.</p>
        )}
      </div>

      <AssetDetailDialog
        asset={selected}
        open={open}
        onOpenChange={setOpen}
        onAdd={(asset, acknowledged) => addToProgram(asset, acknowledged)}
      />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "label-caps rounded-full border px-3 py-1.5 transition-colors",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
