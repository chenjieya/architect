import { configureStore } from "@reduxjs/toolkit";
import FanYiSlice from "./fanyi/fanYiSlice";

export const store = configureStore({
  reducer: {
    fanyi: FanYiSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
