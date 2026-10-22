import classNames from "classnames";
import Icon from "@/components/ui/Icon";
import type { VisionZone } from "@/types/voice";
import TextModeButton from "./TextModeButton";

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
      <TextModeButton onClick={onSwitchToText} />
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
