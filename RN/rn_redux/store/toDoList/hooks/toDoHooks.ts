import { useSelector } from "react-redux";
import { selectorTodoList } from "../toDoListSlice";
import { RootState } from "../../store";

const useAppSelector = useSelector.withTypes<RootState>();

export default {
  getTodoList: () => useAppSelector(selectorTodoList)
};
