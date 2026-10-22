import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ConnectionStatus,
  VerificationPrompt,
  VoiceDisplay,
} from "@/types/voice";

interface VoiceState {
  connection: ConnectionStatus;
  display: VoiceDisplay | null;
  verification: VerificationPrompt | null;
}

const initialState: VoiceState = {
  connection: "disconnected",
  display: null,
  verification: null,
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
    voiceReset() {
      return initialState;
    },
  },
});

export const {
  connectionChanged,
  displayShown,
  displayCleared,
  verificationRequested,
  verificationEnded,
  voiceReset,
} = voiceSlice.actions;
export default voiceSlice.reducer;
