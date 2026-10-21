import classNames from "classnames";
import Icon from "@/components/ui/Icon";
import type { OrbState, VisionZone, VoiceDisplay } from "@/types/voice";
import VoiceOrb from "./VoiceOrb";

const ZONE_LAYOUTS: Record<VisionZone, string> = {
  center: "flex-col justify-center",
  top: "flex-col justify-start",
  bottom: "flex-col-reverse justify-start",
};

const ICON_TONES = {
  success: "text-success",
  danger: "text-danger",
};

interface CallViewProps {
  orb: OrbState;
  display?: VoiceDisplay | null;
  zone: VisionZone;
  reduceMotion?: boolean;
  inert?: boolean;
}

export default function CallView({
  orb,
  display,
  zone,
  reduceMotion,
  inert,
}: CallViewProps) {
  const hasText = Boolean(display?.answer || display?.icon);

  return (
    <div
      inert={inert}
      className={classNames(
        "absolute inset-0 flex items-center gap-10 px-6 pt-[88px] pb-[72px]",
        ZONE_LAYOUTS[zone],
      )}
    >
      {hasText && (
        <div className="flex flex-col items-center gap-2 text-center text-pretty">
          {display?.icon && (
            <Icon
              name={display.icon}
              className={classNames(
                "text-[320px]",
                display.iconTone && ICON_TONES[display.iconTone],
              )}
            />
          )}
          {display?.answer && (
            <div className="text-[3.5em] leading-[1.05] font-bold wrap-anywhere text-accent">
              {display.answer}
            </div>
          )}
          {display?.sub && (
            <div className="text-[1.75em] leading-[1.15] font-bold text-accent">
              {display.sub}
            </div>
          )}
        </div>
      )}
      <VoiceOrb state={orb} compact={hasText} reduceMotion={reduceMotion} />
    </div>
  );
}
