import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VisionZone } from "@/types/voice";

interface SettingsState {
  visionZone: VisionZone;
}

const initialState: SettingsState = {
  visionZone: "center",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    visionZoneChanged(state, action: PayloadAction<VisionZone>) {
      state.visionZone = action.payload;
    },
  },
});

export const { visionZoneChanged } = settingsSlice.actions;
export default settingsSlice.reducer;
