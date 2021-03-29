import React from "react";
import "./App.css";

import Demo from "./views/Demo";
import Login from "./views/Login";
import LandingPage from "./views/LandingPage";
import NavigationBar from "./components/NavigationBar";
import Logout from "./views/Logout";
import Register from "./views/Register";
import ProblemDefinition from "./views/ProblemDefinition";
import ProblemExplore from "./views/ProblemExplore";
import CreateMethod from "./views/MethodCreate";
import { Tokens } from "./types/AppTypes";
import { useState } from "react";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import MethodCreate from "./views/MethodCreate";

function App() {
  const [isLoggedIn, SetIsLoggedIn] = useState<boolean>(false);
  const [loggedAs, SetLoggedAs] = useState<string>("");
  const [methodCreated, SetMethodCreated] = useState<boolean>(false);
  const [tokens, SetTokens] = useState<Tokens>({ access: "", refresh: "" });

  const API_URL: string = "http://127.0.0.1:5000";

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
              apiUrl={API_URL}
              setIsLoggedIn={SetIsLoggedIn}
              setLoggedAs={SetLoggedAs}
              setTokens={SetTokens}
            />
          </Route>
          <Route path="/logout" exact>
            <Logout
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={SetIsLoggedIn}
              setLoggedAs={SetLoggedAs}
              tokens={tokens}
              setTokens={SetTokens}
            />
          </Route>
          <Route path="/register" exact>
            <Register />
          </Route>
          <Route path="/problem/create" exact>
            <ProblemDefinition
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              loggedAs={loggedAs}
              tokens={tokens}
            />
          </Route>
          <Route path="/problem/explore" exact>
            <ProblemExplore
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              loggedAs={loggedAs}
              tokens={tokens}
            />
          </Route>
          <Route path="/method/create" exact>
            <MethodCreate
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              loggedAs={loggedAs}
              tokens={tokens}
              setMethodCreated={SetMethodCreated}
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
