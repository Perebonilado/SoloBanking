import {
  useConversationControls,
  useConversationMode,
} from "@elevenlabs/react";
import type { MouseEvent } from "react";
import { useMultiTap } from "@/hooks/useMultiTap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useVoiceTools } from "@/hooks/useVoiceTools";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/signOut";
import { receiptClosed } from "@/store/slices/receiptSlice";
import { homeLayoutToggled } from "@/store/slices/settingsSlice";
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
  const signedIn = useAppSelector((state) => state.session.accessToken !== null);
  const { visionZone: zone, homeLayout } = useAppSelector(
    (state) => state.settings,
  );
  const reduceMotion = usePrefersReducedMotion();
  const { startSession, endSession } = useConversationControls();
  const { mode } = useConversationMode();
  const { confirmFingerprint, cancelFingerprint } = useVoiceTools();

  const inConversation = connection !== "disconnected";
  const orb: OrbState =
    connection === "connecting"
      ? "think"
      : mode === "speaking"
        ? "speak"
        : "listen";

  const handleDisconnect = () => {
    cancelFingerprint();
    dispatch(voiceReset());
    void dispatch(signOut());
  };

  const registerTap = useMultiTap((taps) => {
    if (receipt) {
      if (taps >= 3 && !verification) {
        if (inConversation) endSession();
        dispatch(receiptClosed());
      }
      return;
    }
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
      ) : inConversation && signedIn ? (
        <HomeView
          layout={homeLayout}
          onToggleLayout={() => dispatch(homeLayoutToggled())}
          inert={Boolean(verification)}
        />
      ) : inConversation ? (
        <CallView
          orb={orb}
          display={display}
          zone={zone}
          reduceMotion={reduceMotion}
          inert={Boolean(verification)}
        />
      ) : (
        <HungUpView zone={zone} />
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
