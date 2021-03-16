import React from "react";
import "./App.css";

import Demo from "./views/Demo";
import Login from "./views/Login";
import LandingPage from "./views/LandingPage";
import NavigationBar from "./components/NavigationBar";
import { Tokens } from "./types/AppTypes";
import { useState } from "react";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isLoggedIn, SetIsLoggedIn] = useState<boolean>(false);
  const [loggedAs, SetLoggedAs] = useState<string>("");
  const [tokens, SetTokens] = useState<Tokens>({ access: "", refresh: "" });

  return (
    <div className="App">
      <Router>
        <NavigationBar isLoggedIn={isLoggedIn} loggedAs={loggedAs} />
        <Switch>
          <Route path="/" exact>
            <LandingPage />
          </Route>
          <Route path="/login" exact>
            <Login
              setIsLoggedIn={SetIsLoggedIn}
              setLoggedAs={SetLoggedAs}
              setTokens={SetTokens}
            />
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
