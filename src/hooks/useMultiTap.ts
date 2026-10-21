import { useEffect, useRef } from "react";

export function useMultiTap(onTaps: (count: number) => void, windowMs = 400) {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return () => {
    count.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const taps = count.current;
      count.current = 0;
      onTaps(taps);
    }, windowMs);
  };
}
