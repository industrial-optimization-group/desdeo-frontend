import React from "react";
import "./App.css";

import Login from "./views/Login";
import LandingPage from "./views/LandingPage";
import NavigationBar from "./components/NavigationBar";
import Logout from "./views/Logout";
import Finish from "./views/Finish";
import ProblemDefinition from "./views/ProblemDefinition";
import ProblemExplore from "./views/ProblemExplore";
import ReferencePointMethod from "./views/ReferencePointMethod";
import NimbusMethod from "./views/NimbusMethod";
import ENautilusMethod from "./views/ENautilusMethod";
import MethodCreate from "./views/MethodCreate";
import Questionnaire from "./views/Questionnaire";
import { Tokens } from "./types/AppTypes";
import { useState } from "react";
import QuestionsModal from "./components/QuestionsModal";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isLoggedIn, SetIsLoggedIn] = useState<boolean>(false);
  const [loggedAs, SetLoggedAs] = useState<string>("");
  const [methodCreated, SetMethodCreated] = useState<boolean>(false);
  const [activeProblemId, SetActiveProblemId] = useState<number | null>(null);
  const [tokens, SetTokens] = useState<Tokens>({ access: "", refresh: "" });
  const [chosenMethod, SetChosenMethod] = useState("");
  const [preferredAnimal, SetPreferredAnimal] = useState<"" | "cat" | "dog">(
    ""
  );

  const API_URL: string = "http://127.0.0.1:5000";

  /*
  const MethodSwitch = (methodName: string) => {
    switch (methodName) {
      case "reference_point_method": {
        return ReferencePointMethod;
      }
      case "synchronous_nimbus": {
        return ReferencePointMethod;
      }
      default: {
        throw Error(
          `Selected method with name ${methodName} is not supported.`
        );
      }
    }
  };
  */

  return (
    <div className="App">
      <Router>
        <NavigationBar isLoggedIn={isLoggedIn} loggedAs={loggedAs} />
        <Switch>
          <Route path="/" exact>
            <LandingPage
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              loggedAs={loggedAs}
              setMethodCreated={SetMethodCreated}
              setActiveProblemId={SetActiveProblemId}
              tokens={tokens}
              setChosenMethod={SetChosenMethod}
              setPreferredAnimal={SetPreferredAnimal}
            />
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
          <Route path="/finish" exact>
            <Finish
              apiUrl={API_URL}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={SetIsLoggedIn}
              setLoggedAs={SetLoggedAs}
              tokens={tokens}
              setTokens={SetTokens}
            />
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
              setChosenMethod={SetChosenMethod}
              setActiveProblemId={SetActiveProblemId}
            />
          </Route>
          <Route path="/method/optimize" exact>
            {chosenMethod === "reference_point_method" && (
              <ReferencePointMethod
                apiUrl={API_URL}
                isLoggedIn={isLoggedIn}
                loggedAs={loggedAs}
                tokens={tokens}
                methodCreated={methodCreated}
                activeProblemId={activeProblemId}
                preferredAnimal={preferredAnimal}
              />
            )}
            {chosenMethod === "synchronous_nimbus" && (
              <NimbusMethod
                apiUrl={API_URL}
                isLoggedIn={isLoggedIn}
                loggedAs={loggedAs}
                tokens={tokens}
                methodCreated={methodCreated}
                activeProblemId={activeProblemId}
                preferredAnimal={preferredAnimal}
              />
            )}
            {chosenMethod === "enautilus" && (
              <ENautilusMethod
                apiUrl={API_URL}
                isLoggedIn={isLoggedIn}
                loggedAs={loggedAs}
                tokens={tokens}
                methodCreated={methodCreated}
                activeProblemId={activeProblemId}
                preferredAnimal={preferredAnimal}
              />
            )}
          </Route>
          <Route path="/questionnaire" exact>
            <QuestionsModal
              apiUrl={API_URL}
              tokens={tokens}
              questionnaireType={"After"}
              nIteration={0}
              description={"Test questionnaire"}
              handleSuccess={(x: boolean) => {
                console.log(`Success? : ${x}`);
              }}
              show={true}
              questionnaireTitle={"Testing the questionnaire"}
            />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
