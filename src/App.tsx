import React from "react";
import "./App.css";

import Demo from "./views/Demo";
import Login from "./views/Login";
import LandingPage from "./views/LandingPage";
import NavigationBar from "./components/NavigationBar";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Router>
        <NavigationBar />
        <Switch>
          <Route path="/" exact>
            <LandingPage />
          </Route>
          <Route path="/login" exact>
            <Login />
          </Route>
          <Route path="/demo" exact>
            <Demo />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
