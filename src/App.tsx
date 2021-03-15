import React from "react";
import "./App.css";

import Demo from "./views/Demo";
import Login from "./views/Login";

import { BrowserRouter as Router, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/demo" exact render={(props) => <Demo />} />
        <Route path="/" exact render={(props) => <Login />} />
      </Router>
    </div>
  );
}

export default App;
