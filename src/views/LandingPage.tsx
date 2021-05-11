import React from "react";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Tokens } from "../types/AppTypes";

interface LandingPageProps {
  apiUrl: string;
  isLoggedIn: boolean;
  loggedAs: string;
  setMethodCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveProblemId: React.Dispatch<React.SetStateAction<number | null>>;
  tokens: Tokens;
  setChosenMethod: React.Dispatch<React.SetStateAction<string>>;
}

function LandingPage({
  apiUrl,
  isLoggedIn,
  loggedAs,
  setMethodCreated,
  setActiveProblemId,
  tokens,
  setChosenMethod,
}: LandingPageProps) {
  const [problemId, SetProblemId] = useState<number>(-1);
  const [state, SetState] = useState<
    "reference_point_method" | "synchronous_nimbus" | "home"
  >("home");

  useEffect(() => {
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
  }, [isLoggedIn, tokens]);

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
      methodName as "reference_point_method" | "synchronous_nimbus" | "home"
    );
    return;
  };

  return (
    <Container>
      <h2>Experimental study</h2>
      {!isLoggedIn && state === "home" && (
        <>
          <Row>
            <Col>
              <p>
                {
                  "In this study, you the participant, will be tasked to solve a multiobjective optimization problem with three objectives to be maximized simultaneously. You will perform this task using two different interactive methods for multiobjective optimization. After solving the problem with each method, you will be asked to fill out a survey."
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
              <Button as={Link} to={"/login"}>
                {"Login"}
              </Button>
            </Col>
            <Col sm={4}></Col>
          </Row>
        </>
      )}
      {isLoggedIn && state === "home" && (
        <>
          <Row>
            <Col>
              <p>
                {
                  "Begin solving the sustainability problem by clicking on one of the buttons below."
                }
              </p>
            </Col>
          </Row>
          <Row>
            <Col sm={2}></Col>
            <Col sm={4}>
              <Button onClick={(_) => onClick("reference_point_method")}>
                {"Reference point method"}
              </Button>
            </Col>
            <Col sm={4}>
              <Button onClick={(_) => onClick("synchronous_nimbus")}>
                {"Synchronous NIMBUS"}
              </Button>
            </Col>
            <Col sm={2}></Col>
          </Row>
        </>
      )}
      {isLoggedIn &&
        (state === "reference_point_method" ||
          state === "synchronous_nimbus") && (
          <>
            <h3>{`${
              state === "reference_point_method"
                ? "Reference point method"
                : "Synchronous NIMBUS"
            } chosen`}</h3>
            <Button as={Link} to="/method/optimize">
              {"Start optimizing!"}
            </Button>
          </>
        )}
    </Container>
  );
}

export default LandingPage;
