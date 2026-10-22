import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SessionState {
  accessToken: string | null;
  expiresAt: number | null;
}

const initialState: SessionState = {
  accessToken: null,
  expiresAt: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionStarted(
      state,
      action: PayloadAction<{ accessToken: string; expiresAt: number }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = action.payload.expiresAt;
    },
    sessionEnded() {
      return initialState;
    },
  },
});

export const { sessionStarted, sessionEnded } = sessionSlice.actions;
export default sessionSlice.reducer;
