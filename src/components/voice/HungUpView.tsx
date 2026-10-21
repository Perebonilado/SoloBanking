import classNames from "classnames";
import Icon from "@/components/ui/Icon";
import type { VisionZone } from "@/types/voice";

const ZONE_JUSTIFY: Record<VisionZone, string> = {
  center: "justify-center",
  top: "justify-start",
  bottom: "justify-end",
};

interface HungUpViewProps {
  zone: VisionZone;
  onSwitchToText?: () => void;
}

export default function HungUpView({
  zone,
  onSwitchToText,
}: HungUpViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col px-6 pt-16 pb-6">
      <button
        type="button"
        aria-label="Switch to text mode"
        onClick={onSwitchToText}
        className={classNames(
          "flex min-h-[4.5em] items-center justify-center gap-4 rounded-[20px] bg-accent text-on-accent",
          "outline-offset-6 outline-accent focus-visible:outline-4",
        )}
      >
        <Icon name="keyboard" className="text-[6em]" />
        <span className="text-[1.75em] font-bold">Text</span>
      </button>
      <div
        className={classNames(
          "flex flex-1 flex-col items-center gap-4 pt-10 pb-12",
          ZONE_JUSTIFY[zone],
        )}
      >
        <Icon name="mic" className="text-[320px]" />
        <div className="text-[1.75em] font-bold">Call</div>
      </div>
    </div>
  );
}
