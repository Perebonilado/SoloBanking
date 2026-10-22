import type { IconName } from "@/components/ui/Icon";

export type VisionZone = "center" | "top" | "bottom";

export type OrbState = "listen" | "think" | "speak";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export type HomeLayout = "apart" | "center";

export interface VoiceDisplay {
  answer?: string;
  sub?: string;
  icon?: IconName;
  iconTone?: "success" | "danger";
}

export interface VerificationPrompt {
  answer?: string;
  sub?: string;
  failed?: boolean;
}
