import type { MouseEvent } from "react";
import { useMultiTap } from "@/hooks/useMultiTap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useVoiceTools } from "@/hooks/useVoiceTools";
import { useVoiceControls, useVoiceMode } from "@/lib/voice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { receiptClosed } from "@/store/slices/receiptSlice";
import {
  homeLayoutToggled,
  screenChanged,
} from "@/store/slices/settingsSlice";
import { connectionChanged, voiceReset } from "@/store/slices/voiceSlice";
import type { ConnectionStatus, OrbState } from "@/types/voice";
import CallView from "./CallView";
import HomeView from "./HomeView";
import HungUpView from "./HungUpView";
import ReceiptView from "./ReceiptView";
import VerificationSheet from "./VerificationSheet";

function toConnection(status: string): ConnectionStatus {
  return status === "connected" || status === "connecting"
    ? status
    : "disconnected";
}

export default function VoiceScreen() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((state) => state.customer.saved);
  const { connection, display, verification } = useAppSelector(
    (state) => state.voice,
  );
  const receipt = useAppSelector((state) =>
    state.receipt.open ? state.receipt.last : null,
  );
  const {
    visionZone: zone,
    homeLayout,
    screen,
  } = useAppSelector((state) => state.settings);
  const reduceMotion = usePrefersReducedMotion();
  const { startSession, endSession } = useVoiceControls();
  const mode = useVoiceMode();
  const { confirmFingerprint, cancelFingerprint } = useVoiceTools();

  const inConversation = connection !== "disconnected";
  const showText = screen === "text";
  const openText = () => dispatch(screenChanged("text"));
  const orb: OrbState =
    connection === "connecting"
      ? "think"
      : mode === "speaking"
        ? "speak"
        : "listen";

  const handleDisconnect = () => {
    cancelFingerprint();
    dispatch(voiceReset());
  };

  const registerTap = useMultiTap((taps) => {
    if (receipt) {
      if (taps >= 3 && !verification) {
        if (inConversation) endSession();
        dispatch(receiptClosed());
      }
      return;
    }
    if (showText && !inConversation) return;
    if (connection === "disconnected" && taps >= 2) {
      dispatch(connectionChanged("connecting"));
      startSession({
        dynamicVariables: {
          has_saved_account: customer !== null,
          customer_name: customer?.name ?? "",
          account_number: customer?.accountNumber ?? "",
          fingerprint_verified: false,
          greeting: customer
            ? `Hi ${customer.name.trim().split(/\s+/)[0]}, it's Ola.`
            : "Hi, I'm Ola.",
        },
        onStatusChange: ({ status }) =>
          dispatch(connectionChanged(toConnection(status))),
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
      {receipt ? (
        <ReceiptView
          receipt={receipt}
          zone={zone}
          orb={inConversation ? orb : null}
          reduceMotion={reduceMotion}
          inert={Boolean(verification)}
        />
      ) : showText ? (
        <HomeView
          layout={homeLayout}
          onToggleLayout={() => dispatch(homeLayoutToggled())}
          onSwitchToVoice={() => dispatch(screenChanged("voice"))}
          inert={Boolean(verification)}
        />
      ) : inConversation ? (
        <CallView
          orb={orb}
          display={display}
          zone={zone}
          reduceMotion={reduceMotion}
          inert={Boolean(verification)}
          onSwitchToText={openText}
        />
      ) : (
        <HungUpView zone={zone} onSwitchToText={openText} />
      )}
      {inConversation && verification && (
        <VerificationSheet
          prompt={verification}
          zone={zone}
          reduceMotion={reduceMotion}
        />
      )}
    </main>
  );
}
