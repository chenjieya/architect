import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import storeState from "./state";

export const fanyiSlice = createSlice({
  name: "fanyi",
  initialState: storeState,
  reducers: {
    setFanyiCatch: (
      state,
      action: PayloadAction<{ from: string; to: string }>
    ) => {
      const { from, to } = action.payload;
      const sourceCatch = state.history;

      // 检测是否已存在
      // if (
      //   sourceCatch.find(
      //     (item) =>
      //       item.txt === action.payload.from && item.res === action.payload.to
      //   )
      // ) {
      //   return;
      // }
      sourceCatch.unshift({ txt: from, res: to });
    },
    changeLanguage: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
    }
  }
});

export const { setFanyiCatch, changeLanguage, clearHistory } =
  fanyiSlice.actions;

export default fanyiSlice.reducer;
