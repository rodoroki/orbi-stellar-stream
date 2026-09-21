/**
 * YouTube Live integration contract.
 *
 * This is an interface-only layer for Prompt 01. No credentials, stream keys or
 * OAuth tokens live in the frontend: every method resolves to NOT_CONFIGURED
 * until a server-side integration is wired.
 */

export type YoutubeConnectionStatus = "NOT_CONFIGURED" | "DISCONNECTED" | "CONNECTED" | "ERROR";

export interface YoutubeChannel {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export interface YoutubeBroadcast {
  id: string;
  title: string;
  status: "created" | "ready" | "live" | "complete";
  watchUrl?: string;
}

export interface YoutubeStream {
  id: string;
  /** Never populated client-side. The ingestion key stays server-side. */
  ingestionAddressMasked: string;
}

export interface YoutubeStatus {
  status: YoutubeConnectionStatus;
  channel: YoutubeChannel | null;
  broadcast: YoutubeBroadcast | null;
  message: string;
}

export interface YoutubeService {
  connect(): Promise<YoutubeStatus>;
  disconnect(): Promise<YoutubeStatus>;
  getChannel(): Promise<YoutubeChannel | null>;
  createBroadcast(input: { title: string; description?: string }): Promise<YoutubeBroadcast | null>;
  createStream(input: { title: string }): Promise<YoutubeStream | null>;
  bindStream(input: { broadcastId: string; streamId: string }): Promise<boolean>;
  startBroadcast(broadcastId: string): Promise<boolean>;
  stopBroadcast(broadcastId: string): Promise<boolean>;
  getStatus(): Promise<YoutubeStatus>;
}

const NOT_CONFIGURED: YoutubeStatus = {
  status: "NOT_CONFIGURED",
  channel: null,
  broadcast: null,
  message:
    "Integração YouTube não configurada. É necessário habilitar o backend e autorizar o canal via OAuth no servidor.",
};

export const youtubeService: YoutubeService = {
  async connect() {
    return NOT_CONFIGURED;
  },
  async disconnect() {
    return { ...NOT_CONFIGURED, status: "DISCONNECTED", message: "Canal desconectado." };
  },
  async getChannel() {
    return null;
  },
  async createBroadcast() {
    return null;
  },
  async createStream() {
    return null;
  },
  async bindStream() {
    return false;
  },
  async startBroadcast() {
    return false;
  },
  async stopBroadcast() {
    return false;
  },
  async getStatus() {
    return NOT_CONFIGURED;
  },
};
