const CAPTURE_PROCESSOR = "solobanking-capture";
const CAPTURE_WORKLET = `class Capture extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
}
registerProcessor("${CAPTURE_PROCESSOR}", Capture);`;

export const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const CHUNK_SAMPLES = 1024;
const PLAYBACK_LEAD_SECONDS = 0.03;

function resample(samples: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return samples;
  const length = Math.floor((samples.length * to) / from);
  const result = new Float32Array(length);
  const step = from / to;
  for (let i = 0; i < length; i += 1) {
    const position = i * step;
    const index = Math.floor(position);
    const next = samples[Math.min(index + 1, samples.length - 1)];
    result[i] = samples[index] + (next - samples[index]) * (position - index);
  }
  return result;
}

function toBase64Pcm(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  samples.forEach((sample, i) => {
    view.setInt16(i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true);
  });
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64Pcm(data: string): Float32Array<ArrayBuffer> {
  const binary = atob(data);
  const view = new DataView(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) view.setUint8(i, binary.charCodeAt(i));
  const samples = new Float32Array(Math.floor(binary.length / 2));
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return samples;
}

function rateOf(mimeType: string | undefined): number {
  const match = mimeType?.match(/rate=(\d+)/);
  return match ? Number(match[1]) : OUTPUT_SAMPLE_RATE;
}

export class MicrophoneStream {
  private readonly context = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private pending: Float32Array[] = [];
  private pendingLength = 0;

  constructor(private readonly onChunk: (base64Pcm: string) => void) {}

  resume() {
    return this.context.resume();
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const url = URL.createObjectURL(
      new Blob([CAPTURE_WORKLET], { type: "application/javascript" }),
    );
    try {
      await this.context.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    const source = this.context.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.context, CAPTURE_PROCESSOR);
    this.node.port.onmessage = (event: MessageEvent<Float32Array>) =>
      this.collect(event.data);
    source.connect(this.node);
  }

  private collect(frame: Float32Array) {
    this.pending.push(frame);
    this.pendingLength += frame.length;
    if (this.pendingLength < CHUNK_SAMPLES) return;
    const joined = new Float32Array(this.pendingLength);
    let offset = 0;
    for (const part of this.pending) {
      joined.set(part, offset);
      offset += part.length;
    }
    this.pending = [];
    this.pendingLength = 0;
    this.onChunk(
      toBase64Pcm(resample(joined, this.context.sampleRate, INPUT_SAMPLE_RATE)),
    );
  }

  stop() {
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.context.close().catch(() => undefined);
  }
}

export class SpeakerQueue {
  private readonly context = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
  private readonly sources = new Set<AudioBufferSourceNode>();
  private nextStart = 0;

  constructor(private readonly onSpeakingChange: (speaking: boolean) => void) {}

  resume() {
    return this.context.resume();
  }

  play(base64Pcm: string, mimeType?: string) {
    const samples = fromBase64Pcm(base64Pcm);
    if (samples.length === 0) return;
    const buffer = this.context.createBuffer(1, samples.length, rateOf(mimeType));
    buffer.copyToChannel(samples, 0);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    const startAt = Math.max(
      this.context.currentTime + PLAYBACK_LEAD_SECONDS,
      this.nextStart,
    );
    source.start(startAt);
    this.nextStart = startAt + buffer.duration;
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) this.onSpeakingChange(false);
    };
    this.sources.add(source);
    if (this.sources.size === 1) this.onSpeakingChange(true);
  }

  interrupt() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
    this.nextStart = 0;
    this.onSpeakingChange(false);
  }

  stop() {
    this.interrupt();
    this.context.close().catch(() => undefined);
  }
}
