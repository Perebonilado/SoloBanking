import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "@/types/customer";
import type {
  ConnectionStatus,
  VerificationPrompt,
  VoiceDisplay,
} from "@/types/voice";

interface VoiceState {
  connection: ConnectionStatus;
  display: VoiceDisplay | null;
  verification: VerificationPrompt | null;
  foundAccount: Customer | null;
  signedInThisCall: boolean;
}

const initialState: VoiceState = {
  connection: "disconnected",
  display: null,
  verification: null,
  foundAccount: null,
  signedInThisCall: false,
};

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    connectionChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.connection = action.payload;
    },
    displayShown(state, action: PayloadAction<VoiceDisplay>) {
      state.display = action.payload;
    },
    displayCleared(state) {
      state.display = null;
    },
    verificationRequested(state, action: PayloadAction<VerificationPrompt>) {
      state.verification = action.payload;
    },
    verificationEnded(state) {
      state.verification = null;
    },
    accountFound(state, action: PayloadAction<Customer>) {
      state.foundAccount = action.payload;
    },
    callSignedIn(state) {
      state.signedInThisCall = true;
    },
    callSignedOut(state) {
      state.signedInThisCall = false;
    },
    voiceReset() {
      return initialState;
    },
  },
});

export const {
  accountFound,
  callSignedIn,
  callSignedOut,
  connectionChanged,
  displayShown,
  displayCleared,
  verificationRequested,
  verificationEnded,
  voiceReset,
} = voiceSlice.actions;
export default voiceSlice.reducer;
