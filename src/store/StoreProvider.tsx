"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { restoreCustomer } from "./slices/customerSlice";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(restoreCustomer());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
