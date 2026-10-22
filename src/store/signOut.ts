import { settle } from "@/lib/apiRequest";
import { authApi } from "@/services/auth/authApi";
import { baseApi } from "@/services/baseApi";
import type { AppDispatch, RootState } from "./index";
import { sessionEnded } from "./slices/sessionSlice";

export const signOut =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const accessToken = getState().session.accessToken;
    dispatch(sessionEnded());
    dispatch(baseApi.util.resetApiState());
    if (!accessToken) return;
    try {
      await settle(dispatch(authApi.endpoints.logout.initiate(accessToken)));
    } catch {
      return;
    }
  };
