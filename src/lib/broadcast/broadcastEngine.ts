/**
 * Broadcast Engine contract (future encoder handoff).
 *
 * The engine is responsible for turning an ordered program into a continuous
 * RTMPS stream (FFmpeg concat / transcode pipeline) executed server-side.
 * Prompt 01 ships the typed contract plus an inert local implementation.
 */

import type { ProgramItem } from "../nasa/types";

export type EncoderStatus = "NOT_CONFIGURED" | "IDLE" | "ENCODING" | "ERROR";

export interface EncoderProfile {
  resolution: "1920x1080" | "2560x1440" | "3840x2160";
  fps: 30 | 60;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  keyframeIntervalSeconds: number;
  codec: "h264" | "hevc";
}

export const DEFAULT_ENCODER_PROFILE: EncoderProfile = {
  resolution: "1920x1080",
  fps: 30,
  videoBitrateKbps: 6000,
  audioBitrateKbps: 128,
  keyframeIntervalSeconds: 2,
  codec: "h264",
};

export interface RenderPlanSegment {
  assetId: string;
  mediaUrl: string;
  startAt: number;
  duration: number;
}

export interface RenderPlan {
  segments: RenderPlanSegment[];
  totalDuration: number;
  profile: EncoderProfile;
}

export interface EngineState {
  status: EncoderStatus;
  message: string;
  currentSegmentIndex: number | null;
}

export interface BroadcastEngine {
  /** Builds the FFmpeg concat plan for the current program. */
  buildRenderPlan(items: ProgramItem[], profile?: EncoderProfile): Promise<RenderPlan>;
  /** Opens the RTMPS pipe (server-side only in a future prompt). */
  openPipe(input: { ingestionUrlRef: string; profile: EncoderProfile }): Promise<boolean>;
  closePipe(): Promise<boolean>;
  start(plan: RenderPlan): Promise<EngineState>;
  stop(): Promise<EngineState>;
  getState(): Promise<EngineState>;
}

const NOT_CONFIGURED: EngineState = {
  status: "NOT_CONFIGURED",
  message:
    "Encoder não configurado. O pipeline FFmpeg/RTMPS será executado no servidor em etapa posterior.",
  currentSegmentIndex: null,
};

export const broadcastEngine: BroadcastEngine = {
  async buildRenderPlan(items, profile = DEFAULT_ENCODER_PROFILE) {
    const { NASA_CATALOG } = await import("../nasa/catalog");
    let startAt = 0;
    const segments: RenderPlanSegment[] = [];
    for (const item of items) {
      const asset = NASA_CATALOG.find((a) => a.id === item.assetId);
      if (!asset) continue;
      segments.push({
        assetId: asset.id,
        mediaUrl: asset.mediaUrl,
        startAt,
        duration: asset.duration,
      });
      startAt += asset.duration;
    }
    return { segments, totalDuration: startAt, profile };
  },
  async openPipe() {
    return false;
  },
  async closePipe() {
    return false;
  },
  async start() {
    return NOT_CONFIGURED;
  },
  async stop() {
    return NOT_CONFIGURED;
  },
  async getState() {
    return NOT_CONFIGURED;
  },
};
