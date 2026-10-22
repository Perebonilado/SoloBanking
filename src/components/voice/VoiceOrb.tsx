import classNames from "classnames";
import type { OrbState } from "@/types/voice";

const LABELS: Record<OrbState, string> = {
  listen: "Ola is listening",
  think: "Ola is thinking",
  speak: "Ola is speaking",
};

const CYCLES: Record<OrbState, string> = {
  listen: "[--orb-cycle:3s]",
  think: "[--orb-cycle:9s]",
  speak: "[--orb-cycle:5s]",
};

const DIM_ANIMATIONS: Record<OrbState, string> = {
  listen: "animate-dim-listen",
  think: "animate-dim-think",
  speak: "animate-dim-speak",
};

interface VoiceOrbProps {
  state: OrbState;
  compact?: boolean;
  reduceMotion?: boolean;
}

export default function VoiceOrb({
  state,
  compact = false,
  reduceMotion = false,
}: VoiceOrbProps) {
  const blob =
    "absolute rounded-full bg-radial from-35% to-transparent to-70% blur-[28px]";

  return (
    <div
      role="img"
      aria-label={LABELS[state]}
      className={classNames(
        "relative flex-none overflow-hidden rounded-full transition-[width,height] duration-400",
        CYCLES[state],
        compact ? "size-[160px] bg-orb-muted" : "size-[300px] bg-accent",
        reduceMotion ? DIM_ANIMATIONS[state] : "animate-orb-breath",
      )}
    >
      <div
        className={classNames(
          blob,
          "inset-[6.667%]",
          !reduceMotion && "animate-drift-1",
          compact ? "from-orb-muted-1" : "from-orb-1",
        )}
      />
      <div
        className={classNames(
          blob,
          "inset-[10%]",
          !reduceMotion && "animate-drift-2",
          compact ? "from-orb-muted-2" : "from-orb-2",
        )}
      />
      <div
        className={classNames(
          blob,
          "inset-[16.667%]",
          !reduceMotion && "animate-drift-3",
          compact ? "from-orb-muted-3" : "from-orb-3",
        )}
      />
    </div>
  );
}
