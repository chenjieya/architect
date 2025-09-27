import React from "react";
import logo from "./logo.svg";
import "./App.css";
import _ from "lodash-es";
import world from "./assets/world.txt";
import markdown from "./assets/note.md";

function App() {
  _.debounce(() => console.log("hello world"), 1000)();
  console.log(world.name, world.age, world.desc);
  return (
    <div className="App">
      <div dangerouslySetInnerHTML={{ __html: markdown.html }} />

      <hr />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
