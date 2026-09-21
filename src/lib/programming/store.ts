import { useSyncExternalStore } from "react";
import { NASA_CATALOG } from "../nasa/catalog";
import type { NasaAsset, ProgramItem, SavedProgram } from "../nasa/types";
import { evaluateRights, summarizeRights, type ProgramRightsSummary } from "../rights/rights";

export interface SettingsState {
  channelName: string;
  programTitle: string;
  autoLoop: boolean;
  encoderResolution: "1920x1080" | "2560x1440" | "3840x2160";
  encoderFps: 30 | 60;
}

export interface OrbiState {
  queue: ProgramItem[];
  history: SavedProgram[];
  settings: SettingsState;
}

const STORAGE_KEY = "orbi-broadcast-control:v1";

const DEFAULT_STATE: OrbiState = {
  queue: [],
  history: [],
  settings: {
    channelName: "",
    programTitle: "ORBI — Bloco Terra",
    autoLoop: true,
    encoderResolution: "1920x1080",
    encoderFps: 30,
  },
};

let state: OrbiState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OrbiState>;
      state = {
        queue: parsed.queue ?? [],
        history: parsed.history ?? [],
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) },
      };
      emit();
    }
  } catch {
    /* ignore corrupted storage */
  }
}

function setState(next: OrbiState) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function uid() {
  return `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const orbiStore = {
  get: () => state,
  subscribe,
  addToProgram(assetId: string, acknowledgedReview = false) {
    setState({ ...state, queue: [...state.queue, { uid: uid(), assetId, acknowledgedReview }] });
  },
  removeFromProgram(itemUid: string) {
    setState({ ...state, queue: state.queue.filter((i) => i.uid !== itemUid) });
  },
  duplicateItem(itemUid: string) {
    const index = state.queue.findIndex((i) => i.uid === itemUid);
    if (index < 0) return;
    const source = state.queue[index]!;
    const copy: ProgramItem = { ...source, uid: uid() };
    const queue = [...state.queue];
    queue.splice(index + 1, 0, copy);
    setState({ ...state, queue });
  },
  moveItem(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= state.queue.length || to >= state.queue.length) return;
    const queue = [...state.queue];
    const [moved] = queue.splice(from, 1);
    if (!moved) return;
    queue.splice(to, 0, moved);
    setState({ ...state, queue });
  },
  acknowledgeItem(itemUid: string) {
    setState({
      ...state,
      queue: state.queue.map((i) => (i.uid === itemUid ? { ...i, acknowledgedReview: true } : i)),
    });
  },
  clearProgram() {
    setState({ ...state, queue: [] });
  },
  saveProgram(name: string) {
    const entries = resolveQueue(state.queue);
    const saved: SavedProgram = {
      id: `pg_${Date.now().toString(36)}`,
      name: name.trim() || "Programação sem título",
      createdAt: new Date().toISOString(),
      items: state.queue,
      totalDuration: entries.reduce((acc, e) => acc + e.asset.duration, 0),
    };
    setState({ ...state, history: [saved, ...state.history] });
    return saved;
  },
  loadProgram(programId: string) {
    const saved = state.history.find((p) => p.id === programId);
    if (!saved) return;
    setState({ ...state, queue: saved.items.map((i) => ({ ...i, uid: uid() })) });
  },
  deleteProgram(programId: string) {
    setState({ ...state, history: state.history.filter((p) => p.id !== programId) });
  },
  updateSettings(patch: Partial<SettingsState>) {
    setState({ ...state, settings: { ...state.settings, ...patch } });
  },
};

export interface ResolvedItem {
  item: ProgramItem;
  asset: NasaAsset;
  acknowledgedReview: boolean;
}

export function resolveQueue(queue: ProgramItem[]): ResolvedItem[] {
  return queue
    .map((item) => {
      const asset = NASA_CATALOG.find((a) => a.id === item.assetId);
      return asset ? { item, asset, acknowledgedReview: item.acknowledgedReview } : null;
    })
    .filter((v): v is ResolvedItem => v !== null);
}

export function useOrbiState(): OrbiState {
  return useSyncExternalStore(orbiStore.subscribe, orbiStore.get, () => DEFAULT_STATE);
}

export interface ProgramSnapshot {
  items: ResolvedItem[];
  totalDuration: number;
  rights: ProgramRightsSummary;
}

export function useProgram(): ProgramSnapshot {
  const { queue } = useOrbiState();
  const items = resolveQueue(queue);
  return {
    items,
    totalDuration: items.reduce((acc, e) => acc + e.asset.duration, 0),
    rights: summarizeRights(items),
  };
}

export { evaluateRights };
