import type { ReactNode } from "react";

export type LineIconName =
  | "send"
  | "list"
  | "eye"
  | "chevronRight"
  | "contract"
  | "expand"
  | "mic";

const PATHS: Record<LineIconName, ReactNode> = {
  send: (
    <>
      <path d="M9.464 21.686a.5.5 0 0 1-.937-.024l-6.5-19a.496.496 0 0 1 .635-.635l19 6.5a.5.5 0 0 1 .024.937l-7.93 3.18a2 2 0 0 0-1.112 1.11z" />
      <path d="M2.146 2.147l10.94 10.939" />
    </>
  ),
  list: (
    <>
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
    </>
  ),
  eye: (
    <>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </>
  ),
  chevronRight: <path d="m9 18 6-6-6-6" />,
  contract: (
    <>
      <rect x="5" y="3" width="14" height="3.5" rx="1.75" />
      <rect x="5" y="17.5" width="14" height="3.5" rx="1.75" />
      <path d="M12 6.5v4.25" />
      <path d="m9.75 8.5 2.25 2.25 2.25-2.25" />
      <path d="M12 17.5v-4.25" />
      <path d="m9.75 15.5 2.25-2.25 2.25 2.25" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </>
  ),
  expand: (
    <>
      <rect x="5" y="10.25" width="14" height="3.5" rx="1.75" />
      <path d="M12 10.25V3" />
      <path d="m9.75 5.25 2.25-2.25 2.25 2.25" />
      <path d="M12 13.75V21" />
      <path d="m9.75 18.75 2.25 2.25 2.25-2.25" />
    </>
  ),
};

interface LineIconProps {
  name: LineIconName;
  className?: string;
  strokeWidth?: number;
}

export default function LineIcon({
  name,
  className,
  strokeWidth = 2,
}: LineIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
