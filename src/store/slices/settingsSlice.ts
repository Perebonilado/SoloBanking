import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { HomeLayout, VisionZone } from "@/types/voice";

interface SettingsState {
  visionZone: VisionZone;
  homeLayout: HomeLayout;
}

const initialState: SettingsState = {
  visionZone: "center",
  homeLayout: "apart",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    visionZoneChanged(state, action: PayloadAction<VisionZone>) {
      state.visionZone = action.payload;
    },
    homeLayoutToggled(state) {
      state.homeLayout = state.homeLayout === "apart" ? "center" : "apart";
    },
  },
});

export const { visionZoneChanged, homeLayoutToggled } = settingsSlice.actions;
export default settingsSlice.reducer;
