import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CallScreen, HomeLayout, VisionZone } from "@/types/voice";

interface SettingsState {
  visionZone: VisionZone;
  homeLayout: HomeLayout;
  screen: CallScreen;
}

const initialState: SettingsState = {
  visionZone: "center",
  homeLayout: "apart",
  screen: "voice",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    visionZoneChanged(state, action: PayloadAction<VisionZone>) {
      state.visionZone = action.payload;
    },
    screenChanged(state, action: PayloadAction<CallScreen>) {
      state.screen = action.payload;
    },
    homeLayoutToggled(state) {
      state.homeLayout = state.homeLayout === "apart" ? "center" : "apart";
    },
  },
});

export const { visionZoneChanged, homeLayoutToggled, screenChanged } =
  settingsSlice.actions;
export default settingsSlice.reducer;
