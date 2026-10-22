import classNames from "classnames";
import Icon from "@/components/ui/Icon";

export default function TextModeButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label="Switch to text mode"
      onClick={onClick}
      className={classNames(
        "flex min-h-[4.5em] flex-none items-center justify-center gap-4 rounded-[20px] bg-accent text-on-accent",
        "outline-offset-6 outline-accent focus-visible:outline-4",
      )}
    >
      <Icon name="keyboard" className="text-[6em]" />
      <span className="text-[1.75em] font-bold">Text</span>
    </button>
  );
}
