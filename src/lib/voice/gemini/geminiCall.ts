import {
  type FunctionCall,
  GoogleGenAI,
  type LiveServerMessage,
  Modality,
  type Session,
} from "@google/genai";
import { announce } from "../announce";
import type {
  VoiceMode,
  VoiceSessionOptions,
  VoiceToolHandler,
} from "../types";
import { AccountReadBack } from "./accountReadBack";
import { INPUT_SAMPLE_RATE, MicrophoneStream, SpeakerQueue } from "./audio";
import { buildInstructions, callStartMessage } from "./instructions";
import { TOOL_DECLARATIONS, WAITS_FOR_FINGERPRINT } from "./tools";

const DEFAULT_MODEL = "gemini-3.8-live";
const configuredModel = process.env.NEXT_PUBLIC_GEMINI_MODEL;

export const GEMINI_LIVE_MODEL =
  configuredModel && !configuredModel.includes("native-audio")
    ? configuredModel
    : DEFAULT_MODEL;
export const GEMINI_VOICE = process.env.NEXT_PUBLIC_GEMINI_VOICE || "Charon";

const CONNECT_TIMEOUT_MS = 10_000;
const MAX_RESUMES = 3;

export const CALL_FAILED_MESSAGE =
  "Sorry, I can't connect right now. Please tap twice to try again.";
const CALL_DROPPED_MESSAGE =
  "Sorry, the call dropped. Please tap twice to call me again.";
const MICROPHONE_BLOCKED_MESSAGE =
  "I need permission to use your microphone. Please allow it, then tap twice to try again.";

export type ToolRegistry = Map<string, { current: VoiceToolHandler }>;

interface GeminiCallOptions extends VoiceSessionOptions {
  tools: ToolRegistry;
  onModeChange: (mode: VoiceMode) => void;
}

interface PendingFingerprint {
  call: FunctionCall;
  connection: number;
  onScreen: boolean;
}

function toResponseBody(output: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(output);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { result: parsed };
  } catch {
    return { result: output };
  }
}

function isMicrophoneBlocked(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "SecurityError")
  );
}

export class GeminiCall {
  private readonly ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });
  private readonly speaker: SpeakerQueue;
  private readonly microphone: MicrophoneStream;
  private readonly readBack = new AccountReadBack();
  private readonly cancelled = new Set<string>();
  private readonly outbox: string[] = [];
  private session: Session | null = null;
  private connection = 0;
  private resumeHandle: string | null = null;
  private resumes = 0;
  private pendingFingerprint: PendingFingerprint | null = null;
  private everConnected = false;
  private finished = false;

  constructor(private readonly options: GeminiCallOptions) {
    this.speaker = new SpeakerQueue((speaking) =>
      options.onModeChange(speaking ? "speaking" : "listening"),
    );
    this.microphone = new MicrophoneStream((data) =>
      this.session?.sendRealtimeInput({
        audio: { data, mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}` },
      }),
    );
    this.speaker.resume().catch(() => undefined);
    this.microphone.resume().catch(() => undefined);
  }

  async start() {
    this.options.onStatusChange({ status: "connecting" });
    try {
      this.session = await this.connect();
      await this.microphone.start();
      if (this.finished) return;
      this.everConnected = true;
      this.options.onStatusChange({ status: "connected" });
      this.session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text: callStartMessage(this.options.dynamicVariables) }],
          },
        ],
        turnComplete: true,
      });
    } catch (error) {
      this.finish(
        isMicrophoneBlocked(error)
          ? MICROPHONE_BLOCKED_MESSAGE
          : CALL_FAILED_MESSAGE,
      );
    }
  }

  end() {
    this.finish();
  }

  fingerprintPromptShown() {
    const pending = this.pendingFingerprint;
    if (!pending || pending.onScreen) return;
    pending.onScreen = true;
    if (this.isLive(pending.call, pending.connection)) {
      this.session?.sendToolResponse({
        functionResponses: [
          {
            id: pending.call.id,
            name: pending.call.name,
            response: { status: "prompt_on_screen" },
          },
        ],
      });
    } else {
      this.sendAppUpdate(
        `The ${pending.call.name} fingerprint check is now on the customer's screen. Tell them to touch their fingerprint sensor, then wait for the result.`,
      );
    }
  }

  private async connect(): Promise<Session> {
    const connection = ++this.connection;
    const opening = this.ai.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: buildInstructions(this.options.dynamicVariables),
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        sessionResumption: this.resumeHandle ? { handle: this.resumeHandle } : {},
      },
      callbacks: {
        onmessage: (message) => {
          if (connection === this.connection) this.handle(message);
        },
        onclose: () => {
          if (connection === this.connection) this.dropped();
        },
      },
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    opening.then(
      (late) => {
        if (timedOut) late.close();
      },
      () => undefined,
    );
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        reject(new Error("Gemini did not answer in time"));
      }, CONNECT_TIMEOUT_MS);
    });
    try {
      const session = await Promise.race([opening, timeout]);
      if (this.finished || connection !== this.connection) {
        session.close();
        throw new Error("The call has already ended");
      }
      return session;
    } finally {
      clearTimeout(timer);
    }
  }

  private async dropped() {
    if (this.finished) return;
    if (!this.resumeHandle || this.resumes >= MAX_RESUMES) {
      this.finish(this.everConnected ? CALL_DROPPED_MESSAGE : CALL_FAILED_MESSAGE);
      return;
    }
    this.resumes += 1;
    this.session = null;
    this.speaker.interrupt();
    try {
      const session = await this.connect();
      this.session = session;
      for (const text of this.outbox.splice(0)) {
        session.sendClientContent({
          turns: [{ role: "user", parts: [{ text }] }],
          turnComplete: true,
        });
      }
    } catch {
      this.finish(CALL_DROPPED_MESSAGE);
    }
  }

  private handle(message: LiveServerMessage) {
    const update = message.sessionResumptionUpdate;
    if (update?.resumable && update.newHandle) this.resumeHandle = update.newHandle;
    for (const id of message.toolCallCancellation?.ids ?? []) this.cancelled.add(id);
    const content = message.serverContent;
    if (content?.interrupted) {
      this.speaker.interrupt();
      this.readBack.turnEnded();
    }
    if (content?.inputTranscription?.text?.trim()) this.readBack.customerSpoke();
    if (content?.outputTranscription?.text) {
      this.readBack.olaSaid(content.outputTranscription.text);
    }
    for (const part of content?.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) {
        this.speaker.play(part.inlineData.data, part.inlineData.mimeType);
      }
    }
    if (content?.turnComplete) this.readBack.turnEnded();
    for (const call of message.toolCall?.functionCalls ?? []) {
      this.runTool(call);
    }
  }

  private isLive(call: FunctionCall, connection: number) {
    return (
      !this.finished &&
      this.session !== null &&
      connection === this.connection &&
      !this.cancelled.has(call.id ?? "")
    );
  }

  private reply(
    call: FunctionCall,
    connection: number,
    response: Record<string, unknown>,
    mustReport: boolean,
  ) {
    if (this.finished) return;
    if (this.isLive(call, connection)) {
      this.session?.sendToolResponse({
        functionResponses: [{ id: call.id, name: call.name, response }],
      });
      return;
    }
    if (!mustReport && this.cancelled.has(call.id ?? "")) return;
    this.sendAppUpdate(`${call.name} finished: ${JSON.stringify(response)}`);
  }

  private runTool(call: FunctionCall) {
    const connection = this.connection;
    if (WAITS_FOR_FINGERPRINT.has(call.name ?? "")) {
      this.runFingerprintTool(call, connection);
      return;
    }
    this.respondTo(call).then((response) =>
      this.reply(call, connection, response, false),
    );
  }

  private runFingerprintTool(call: FunctionCall, connection: number) {
    if (this.pendingFingerprint) {
      this.reply(
        call,
        connection,
        {
          status: "still_waiting",
          instruction:
            "A fingerprint check is still on the customer's screen. Remind them to touch their fingerprint sensor, then wait for the [App update].",
        },
        false,
      );
      return;
    }
    const pending: PendingFingerprint = { call, connection, onScreen: false };
    this.pendingFingerprint = pending;
    this.respondTo(call).then((response) => {
      if (this.pendingFingerprint === pending) this.pendingFingerprint = null;
      if (pending.onScreen) {
        this.sendAppUpdate(
          `${call.name} finished: ${JSON.stringify(response)}. Tell the customer the outcome and carry on with what they asked for.`,
        );
      } else {
        this.reply(call, connection, response, true);
      }
    });
  }

  private sendAppUpdate(text: string) {
    if (this.finished) return;
    const message = `[App update] ${text}`;
    if (!this.session) {
      this.outbox.push(message);
      return;
    }
    this.session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: message }] }],
      turnComplete: true,
    });
  }

  private async respondTo(call: FunctionCall): Promise<Record<string, unknown>> {
    if (call.name === "verify_account") {
      const readBack = this.readBack.check(call.args?.account_number);
      if (readBack) return readBack;
    }
    const handler = this.options.tools.get(call.name ?? "")?.current;
    try {
      if (!handler) throw new Error(`Unknown tool ${call.name}`);
      return toResponseBody(await handler(call.args ?? {}));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "The tool failed",
      };
    }
  }

  private finish(failure?: string) {
    if (this.finished) return;
    this.finished = true;
    this.connection += 1;
    try {
      this.session?.close();
    } catch {
      this.session = null;
    }
    this.microphone.stop();
    this.speaker.stop();
    this.options.onModeChange("listening");
    this.options.onStatusChange({ status: "disconnected" });
    this.options.onDisconnect();
    if (failure) announce(failure);
  }
}
