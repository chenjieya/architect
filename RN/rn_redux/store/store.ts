import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./counter/counterSlice";
import toDoListSlice from "./toDoList/toDoListSlice";

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    toDoList: toDoListSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
