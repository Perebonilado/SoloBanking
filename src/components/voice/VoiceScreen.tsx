import {
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import type { MouseEvent } from "react";
import { useFingerprintTool } from "@/hooks/useFingerprintTool";
import { useMultiTap } from "@/hooks/useMultiTap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { voiceReset } from "@/store/slices/voiceSlice";
import type { OrbState } from "@/types/voice";
import CallView from "./CallView";
import HungUpView from "./HungUpView";
import VerificationSheet from "./VerificationSheet";

export default function VoiceScreen() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((state) => state.customer.saved);
  const { display, verification } = useAppSelector((state) => state.voice);
  const zone = useAppSelector((state) => state.settings.visionZone);
  const reduceMotion = usePrefersReducedMotion();
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { mode } = useConversationMode();
  const { confirmFingerprint, cancelFingerprint } = useFingerprintTool();

  const inConversation = status === "connecting" || status === "connected";
  const orb: OrbState =
    status === "connecting" ? "think" : mode === "speaking" ? "speak" : "listen";

  const handleDisconnect = () => {
    cancelFingerprint();
    dispatch(voiceReset());
  };

  const registerTap = useMultiTap((taps) => {
    if (status === "disconnected" && taps >= 2) {
      startSession({
        dynamicVariables: {
          has_saved_account: customer !== null,
          customer_name: customer?.name ?? "",
          account_number: customer?.accountNumber ?? "",
          fingerprint_verified: false,
          greeting: customer
            ? `Hi ${customer.name.trim().split(/\s+/)[0]}, it's Ava.`
            : "Hi, I'm Ava.",
        },
        onDisconnect: handleDisconnect,
      });
    } else if (inConversation && !verification && taps >= 3) {
      endSession();
    }
  });

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (verification) {
      confirmFingerprint();
    } else if (!(event.target as Element).closest("button")) {
      registerTap();
    }
  };

  return (
    <main
      onClick={handleClick}
      className="relative h-dvh w-full touch-manipulation overflow-hidden bg-black text-[length:min(1rem,32px)] leading-[normal] text-white select-none"
    >
      {inConversation ? (
        <>
          <CallView
            orb={orb}
            display={display}
            zone={zone}
            reduceMotion={reduceMotion}
            inert={Boolean(verification)}
          />
          {verification && (
            <VerificationSheet
              prompt={verification}
              zone={zone}
              reduceMotion={reduceMotion}
            />
          )}
        </>
      ) : (
        <HungUpView zone={zone} />
      )}
    </main>
  );
}
