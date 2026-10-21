import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VerificationPrompt, VoiceDisplay } from "@/types/voice";

interface VoiceState {
  display: VoiceDisplay | null;
  verification: VerificationPrompt | null;
}

const initialState: VoiceState = {
  display: null,
  verification: null,
};

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
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
  displayShown,
  displayCleared,
  verificationRequested,
  verificationEnded,
  voiceReset,
} = voiceSlice.actions;
export default voiceSlice.reducer;
