import classNames from "classnames";
import { useId } from "react";
import Icon from "@/components/ui/Icon";
import type { VerificationPrompt, VisionZone } from "@/types/voice";

interface VerificationSheetProps {
  prompt: VerificationPrompt;
  zone: VisionZone;
  reduceMotion?: boolean;
}

export default function VerificationSheet({
  prompt,
  zone,
  reduceMotion = false,
}: VerificationSheetProps) {
  const answerId = useId();
  const subId = useId();

  return (
    <>
      <div className="absolute inset-0 bg-black" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          prompt.answer
            ? [answerId, prompt.sub && subId].filter(Boolean).join(" ")
            : undefined
        }
        aria-label={prompt.answer ? undefined : "Touch your fingerprint sensor"}
        className={classNames(
          "absolute inset-x-0 bottom-0 flex h-[70%] flex-col items-center gap-3 rounded-t-[40px] bg-surface px-6 text-center",
          zone === "top" ? "justify-start pt-10" : "justify-center",
        )}
      >
        {prompt.answer ? (
          <>
            <div
              id={answerId}
              className="text-[3.5em] leading-[1.05] font-bold"
            >
              {prompt.answer}
            </div>
            {prompt.sub && (
              <div
                id={subId}
                className="mb-7 text-[1.75em] leading-[1.15] font-bold"
              >
                {prompt.sub}
              </div>
            )}
          </>
        ) : (
          <div
            aria-hidden="true"
            className={classNames(
              "mb-7 size-[72px] rounded-full border-8 border-accent/25 border-t-accent",
              reduceMotion ? "animate-pulse" : "animate-spin",
            )}
          />
        )}
        <Icon
          name="fingerprint"
          label="Touch your fingerprint sensor"
          className={classNames(
            "text-[320px]",
            prompt.failed ? "text-danger" : "text-accent",
            reduceMotion ? "animate-fp-dim" : "animate-fp-pulse",
          )}
        />
      </div>
    </>
  );
}
