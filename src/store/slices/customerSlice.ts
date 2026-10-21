import {
  createSlice,
  type Dispatch,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Customer } from "@/types/customer";

const STORAGE_KEY = "solobanking.customer";

interface CustomerState {
  saved: Customer | null;
}

const initialState: CustomerState = {
  saved: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    customerSet(state, action: PayloadAction<Customer>) {
      state.saved = action.payload;
    },
  },
});

const { customerSet } = customerSlice.actions;

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== "object" || value === null) return false;
  const { name, accountNumber } = value as Record<string, unknown>;
  return typeof name === "string" && typeof accountNumber === "string";
}

export const rememberCustomer =
  (customer: Customer) => (dispatch: Dispatch) => {
    dispatch(customerSet(customer));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } catch {
      return;
    }
  };

export const restoreCustomer = () => (dispatch: Dispatch) => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (isCustomer(saved)) dispatch(customerSet(saved));
  } catch {
    return;
  }
};

export default customerSlice.reducer;
