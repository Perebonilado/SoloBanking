import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/services/baseApi";
import customerReducer from "./slices/customerSlice";
import receiptReducer from "./slices/receiptSlice";
import sessionReducer from "./slices/sessionSlice";
import settingsReducer from "./slices/settingsSlice";
import voiceReducer from "./slices/voiceSlice";

const rootReducer = combineReducers({
  customer: customerReducer,
  receipt: receiptReducer,
  session: sessionReducer,
  settings: settingsReducer,
  voice: voiceReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
