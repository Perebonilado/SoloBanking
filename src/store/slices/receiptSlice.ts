import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Receipt } from "@/types/receipt";

interface ReceiptState {
  last: Receipt | null;
  open: boolean;
}

const initialState: ReceiptState = {
  last: null,
  open: false,
};

const receiptSlice = createSlice({
  name: "receipt",
  initialState,
  reducers: {
    receiptShown(state, action: PayloadAction<Receipt>) {
      state.last = action.payload;
      state.open = true;
    },
    receiptReopened(state) {
      state.open = state.last !== null;
    },
    receiptClosed(state) {
      state.open = false;
    },
    receiptForgotten() {
      return initialState;
    },
  },
});

export const {
  receiptShown,
  receiptReopened,
  receiptClosed,
  receiptForgotten,
} = receiptSlice.actions;
export default receiptSlice.reducer;
