import React from "react";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Tokens } from "../types/AppTypes";
import Figure from "react-bootstrap/Figure";

interface LandingPageProps {
  apiUrl: string;
  isLoggedIn: boolean;
  loggedAs: string;
  setMethodCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveProblemId: React.Dispatch<React.SetStateAction<number | null>>;
  tokens: Tokens;
  setChosenMethod: React.Dispatch<React.SetStateAction<string>>;
  setPreferredAnimal: React.Dispatch<React.SetStateAction<"" | "cat" | "dog">>;
}

function LandingPage({
  apiUrl,
  isLoggedIn,
  loggedAs,
  setMethodCreated,
  setActiveProblemId,
  tokens,
  setChosenMethod,
  setPreferredAnimal,
}: LandingPageProps) {
  const [problemId, SetProblemId] = useState<number>(-1);
  const [state, SetState] = useState<
    "reference_point_method" | "synchronous_nimbus" | "enautilus" | "home"
  >("home");
  const [preferredAnimal, SetPreferredAnimal] = useState<"cat" | "dog" | "">(
    ""
  );

  /*
  function StateToName(
    stateName:
      | "reference_point_method"
      | "synchronous_nimbus"
      | "enautilus"
      | "home"
  ) {
    if (stateName === "reference_point_method") {
      return "Reference point method";
    } else if (stateName === "synchronous_nimbus") {
      return "Synchronous NIMBUS";
    } else if (stateName === "enautilus") {
      return "E-NAUTILUS";
    } else if (stateName == "home") {
      return "No method selected";
    } else {
      return "Something went wrong";
    }
  }
  */

  useEffect(() => {
    if (preferredAnimal === "") {
      // do nothing
      return;
    }
    if (isLoggedIn && tokens.access !== "") {
      // fetch the problem
      const fetchProblems = async () => {
        try {
          const res = await fetch(`${apiUrl}/problem/access`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
            },
          });

          if (res.status == 200) {
            const body = await res.json();
            setActiveProblemId(body.problems[0].id);
            SetProblemId(body.problems[0].id);
            // problems fetched!
          } else {
            console.log(
              `Got return code ${res.status}. Could not fetch problems.`
            );
            // do nothing
          }
        } catch (e) {
          console.log("not ok");
          console.log(e);
          //do nothing
        }
      };

      fetchProblems();

      return;
    } else {
      // do nothing
      return;
    }
  }, [preferredAnimal]);

  /*
  useEffect(() => {
    const regxp_rmp = new RegExp("^rpm_");
    const regxp_nimbus = new RegExp("^nimbus_");
    const regxp_enautilus = new RegExp("^enautilus_");

    if (regxp_rmp.test(loggedAs)) {
      // rpm
      SetState("reference_point_method");
      onClick("reference_point_method");
    } else if (regxp_nimbus.test(loggedAs)) {
      // nimbus
      SetState("synchronous_nimbus");
      onClick("synchronous_nimbus");
    } else if (regxp_enautilus.test(loggedAs)) {
      // enautilus
      SetState("enautilus");
      onClick("enautilus");
    } else {
      // do nothing
    }
  }, [problemId]);
  */

  const onClick = (methodName: string) => {
    const createMethod = async () => {
      if (problemId === -1) {
        // do nothing
        return;
      }
      const data = { problem_id: problemId, method: methodName };
      try {
        const res = await fetch(`${apiUrl}/method/create`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${tokens.access}`,
          },
          body: JSON.stringify(data),
        });

        if (res.status == 201) {
          const body = await res.json();
          setMethodCreated(true);
          setChosenMethod(methodName);
          // created!
        } else {
          console.log(
            `Got return code ${res.status}. Could not create method.`
          );
          // do nothing
        }
      } catch (e) {
        console.log(e);
        // do nothing
      }
    };

    createMethod();
    SetState(
      methodName as
        | "reference_point_method"
        | "synchronous_nimbus"
        | "enautilus"
        | "home"
    );
    return;
  };

  return (
    <Container>
      <h2>
        {preferredAnimal === ""
          ? "Find out your ideal cat or dog breed!"
          : preferredAnimal === "cat"
          ? "Find out your ideal cat breed!"
          : "Find out your ideal dog breed!"}
      </h2>
      {!isLoggedIn && state === "home" && (
        <>
          <Row>
            <Col>
              <p>
                {
                  "In this study, you the participant, will be tasked to solve a multiobjective optimization problem with three objectives to be maximized simultaneously. You will perform this task using an interactive method for multiobjective optimization. Throughout the solving process, you will be prompted with various questionnaires. At the end of the process, you will need to answer one final questionnaire."
                }
              </p>

              <p>
                {
                  "You may begin by logging in with the credentials that have been provided to you before the experiment."
                }
              </p>
            </Col>
          </Row>
          <Row>
            <Col sm={4}></Col>
            <Col sm={4}>
              <Link to={"/login"}>
                <Button>{"Login"}</Button>
              </Link>
            </Col>
            <Col sm={4}></Col>
          </Row>
        </>
      )}
      {isLoggedIn && state === "home" && preferredAnimal !== "" && (
        <>
          <Row>
            <Col>
              <p>{"I would like to give preferences in the form of..."}</p>
            </Col>
          </Row>
          <Row>
            <Col sm={4}>
              <Button onClick={(_) => onClick("reference_point_method")}>
                {"A reference point"}
              </Button>
            </Col>
            <Col sm={4}>
              <Button onClick={(_) => onClick("synchronous_nimbus")}>
                {"Classifications"}
              </Button>
            </Col>
            <Col sm={4}>
              <Button onClick={(_) => onClick("enautilus")}>
                {"By not trading off"}
              </Button>
            </Col>
          </Row>
        </>
      )}
      {isLoggedIn && state === "home" && preferredAnimal === "" && (
        <>
          <Row>
            <Col>
              <p>{"I like..."}</p>
            </Col>
          </Row>
          <Row>
            <Col sm={2} />
            <Col sm={3}>
              <h3>{"Cats! 😻"}</h3>
              <Figure>
                <Figure.Image
                  alt={"Pile of cats!"}
                  src={"animal_pics/cats.jpg"}
                  height={"100%"}
                />
              </Figure>
              <Button
                onClick={(_) => {
                  SetPreferredAnimal("cat");
                }}
              >
                <>{"Choose cats!"}</>
              </Button>
            </Col>
            <Col sm={2} />
            <Col sm={3}>
              <h3>{"Dogs! 🐕"}</h3>
              <Figure>
                <Figure.Image
                  alt={"Pile of dogs!"}
                  src={"animal_pics/dogs.jpg"}
                />
              </Figure>
              <Button
                onClick={(_) => {
                  setPreferredAnimal("dog");
                }}
              >
                {"Choose dogs!"}
              </Button>
            </Col>
            <Col sm={2} />
          </Row>
        </>
      )}
      {isLoggedIn &&
        (state === "reference_point_method" ||
          state === "synchronous_nimbus" ||
          state === "enautilus") && (
          <>
            <Link to={"/method/optimize"}>
              <Button>{`Let us find out your ideal ${preferredAnimal} breed!`}</Button>
            </Link>
          </>
        )}
    </Container>
  );
}

export default LandingPage;
