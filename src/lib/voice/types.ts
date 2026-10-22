export type ToolParameters = Record<string, unknown>;

export type VoiceToolHandler = (parameters: ToolParameters) => Promise<string>;

export type VoiceMode = "speaking" | "listening";

export type VoiceVariables = {
  has_saved_account: boolean;
  customer_name: string;
  account_number: string;
  fingerprint_verified: boolean;
  greeting: string;
};

export interface VoiceSessionOptions {
  dynamicVariables: VoiceVariables;
  onStatusChange: (event: { status: string }) => void;
  onDisconnect: () => void;
}

export interface VoiceControls {
  startSession: (options: VoiceSessionOptions) => void;
  endSession: () => void;
}
