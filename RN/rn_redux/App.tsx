import { store } from "./store/store";
import { Provider } from "react-redux";
import Counter from "./components/Counter";
import ToDoList from "./components/ToDoList";

export default function App() {
  return (
    <Provider store={store}>
      {/* <Counter /> */}
      <ToDoList />
    </Provider>
  );
}
