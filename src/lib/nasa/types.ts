export type RightsStatus = "broadcast_ok" | "review" | "blocked";
export type YoutubePolicy = "allowed" | "review" | "blocked";
export type AudioStatus = "Clear" | "Review" | "Unknown";

export type CategoryId =
  | "earth"
  | "ocean"
  | "moon"
  | "space_weather"
  | "space"
  | "satellites"
  | "earth_at_night"
  | "earth_science";

export interface NasaCategory {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface NasaAsset {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  thumbnailUrl: string;
  mediaUrl: string;
  category: CategoryId;
  duration: number;
  resolution: string;
  fps: number;
  format: "MP4" | "WebM";
  audioStatus: AudioStatus;
  rightsStatus: RightsStatus;
  broadcastAllowed: boolean;
  youtubeAllowed: YoutubePolicy;
  thirdPartyContent: boolean;
  commercialUse: boolean;
  orbiWeb: boolean;
  broadcastPriority: number;
  notes: string;
}

export interface ProgramItem {
  /** unique instance id inside the queue (an asset can be duplicated) */
  uid: string;
  assetId: string;
  acknowledgedReview: boolean;
}

export interface SavedProgram {
  id: string;
  name: string;
  createdAt: string;
  items: ProgramItem[];
  totalDuration: number;
}

export type BroadcastState = "OFFLINE" | "READY" | "LIVE";
