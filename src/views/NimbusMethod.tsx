import React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  ProblemInfo,
  ObjectiveData,
  ObjectiveDatum,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import ReferencePointInputForm from "../components/ReferencePointInputForm";
import { Container, Row, Col, Button } from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions } from "../utils/DataHandling";
import { HorizontalBars } from "visual-components";
import SolutionTable from "../components/SolutionTable";

interface NimbusMethodProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
  methodCreated: boolean;
  activeProblemId: number | null;
}

type Classification = "<" | "<=" | ">=" | "=" | "0";

function NimbusMethod({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
  methodCreated,
  activeProblemId,
}: NimbusMethodProps) {
  const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
  const [methodStarted, SetMethodStarted] = useState<boolean>(false);
  const [helpMessage, SetHelpMessage] = useState<string>(
    "Method not started yet."
  );
  const [preferredPoint, SetPreferredPoint] = useState<number[]>([]);
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);
  const [state, SetState] = useState<
    "not started" | "classification" | "archive" | "intermediate" | "stop"
  >("not started");
  const [classifications, SetClassifications] = useState<Classification[]>([]);

  // fetch current problem info
  useEffect(() => {
    if (!methodCreated) {
      // method not defined yet, do nothing
      console.log("useEffect: method not defined");
      return;
    }
    if (activeProblemId === null) {
      // no active problem, do nothing
      console.log("useEffect: active problem is null");
      return;
    }

    const fetchProblemInfo = async () => {
      try {
        const res = await fetch(`${apiUrl}/problem/access`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ problem_id: activeProblemId }),
        });

        if (res.status == 200) {
          // ok!
          const body = await res.json();
          SetActiveProblemInfo({
            problemId: body.problem_id,
            problemName: body.problem_name,
            problemType: body.problem_type,
            objectiveNames: body.objective_names,
            variableNames: body.variable_names,
            nObjectives: body.n_objectives,
            ideal: body.ideal,
            nadir: body.nadir,
            minimize: body.minimize,
          });
          SetClassifications(body.objective_names.map(() => "="));
          SetFetchedInfo(true);
        } else {
          //some other code
          console.log(`could not fetch problem, got status code ${res.status}`);
        }
      } catch (e) {
        console.log("not ok");
        console.log(e);
        // do nothing
      }
    };

    fetchProblemInfo();
  }, []);

  // start the method
  useEffect(() => {
    if (activeProblemInfo === undefined) {
      // no active problem, do nothing
      console.log("Active problem not defined yet.");
      return;
    }

    if (methodStarted) {
      // method already started, do nothing
      return;
    }
    // start the method
    const startMethod = async () => {
      try {
        const res = await fetch(`${apiUrl}/method/control`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (res.status == 200) {
          const body = await res.json();
          SetHelpMessage(body.response.message);
          SetMethodStarted(true);
          SetPreferredPoint(body.response.objective_values);
          SetState("classification");
        }
      } catch (e) {
        console.log("not ok, could not start the method");
        console.log(`${e}`);
      }
    };

    startMethod();
  }, [activeProblemInfo, methodStarted]);

  const iterate = async () => {
    // Attempt to iterate
    SetLoading(true);
    console.log("loading...");
    /*
    try {
      const res = await fetch(`${apiUrl}/method/control`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: { reference_point: referencePoint } }),
      });

      if (res.status === 200) {
        // ok
        const body = await res.json();
        const response = JSON.parse(body.response);
        SetHelpMessage(response.message);
        SetReferencePoint(response.current_solution);
        SetCurrentPoint(response.current_solution);
        SetAlternatives(
          ParseSolutions(
            [response.current_solution].concat(response.additional_solutions),
            activeProblemInfo!
          )
        );
        console.log(response.additional_solutions);
      } else {
        console.log("Got a response which is not 200");
      }
    } catch (e) {
      console.log("Could not iterate RFP");
      console.log(e);
      // do nothing
    }
    */
    SetLoading(false);
    console.log("done!");
  };

  const inferClassifications = useCallback(
    (selection: number[]) => {
      const classes = selection.map((value) => {
        return ">";
      });
    },
    [preferredPoint]
  );

  if (
    !methodCreated ||
    activeProblemId === null ||
    activeProblemInfo === undefined
  ) {
    return <>Please define a method first.</>;
  }

  return (
    <Container>
      <Row>
        <Col sm={4}></Col>
        <Col sm={4}>
          <h2>Classification</h2>
          <Button block={true} size={"lg"} onClick={iterate}>
            Iterate
          </Button>
          <p>Current classifications</p>
        </Col>
        <Col sm={4}></Col>
      </Row>
      {state === "not started" && <div>Method not started yet</div>}
      {state === "classification" && (
        <>
          <Row>
            <Col sm={4}>Manual input goes here</Col>
            <Col sm={8}>
              <HorizontalBars
                objectiveData={ParseSolutions(
                  [preferredPoint],
                  activeProblemInfo
                )}
                referencePoint={preferredPoint}
                currentPoint={preferredPoint}
                setReferencePoint={(e: number[]) => inferClassifications(e)}
              />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default NimbusMethod;
