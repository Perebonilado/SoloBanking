import classNames from "classnames";

const ICON_NAMES = ["check", "fingerprint", "keyboard", "mic"] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_FONT_URL = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,700,1,0&icon_names=${ICON_NAMES.join(",")}&display=block`;

interface IconProps {
  name: IconName;
  label?: string;
  className?: string;
}

export default function Icon({ name, label, className }: IconProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={classNames("icon", className)}
    >
      {name}
    </span>
  );
}
