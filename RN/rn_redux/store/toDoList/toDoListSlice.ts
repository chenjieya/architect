import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface ToDoListState {
  title: string;
  IsDone: boolean;
}

const initialState: ToDoListState[] = [
  {
    title: "吃饭",
    IsDone: false
  },
  {
    title: "睡觉",
    IsDone: false
  },
  {
    title: "打豆豆",
    IsDone: false
  }
];

const toDoListSlice = createSlice({
  name: "toDoList",
  initialState,
  reducers: {
    addToDoList: (state, action: PayloadAction<string>) => {
      const content = action.payload;
      if (content.trim()) {
        state.push({
          title: content,
          IsDone: false
        });
      }
    },
    deleteToDoList: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.splice(index, 1);
    },
    changeItemStatus: (state, action: PayloadAction<number>) => {
      state[action.payload].IsDone = !state[action.payload].IsDone;
    }
  }
});

export const { addToDoList, deleteToDoList, changeItemStatus } =
  toDoListSlice.actions;

export default toDoListSlice.reducer;

export const selectorTodoList = (state: RootState) => state.toDoList;
