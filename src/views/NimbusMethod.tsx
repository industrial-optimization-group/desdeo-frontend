import React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  ProblemInfo,
  ObjectiveData,
  ObjectiveDatum,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import ClassificationsInputForm from "../components/ClassificationsInputForm";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
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
type NimbusState =
  | "not started"
  | "classification"
  | "archive"
  | "intermediate"
  | "stop";

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
  const [nimbusState, SetNimbusState] = useState<NimbusState>("not started");
  const [classifications, SetClassifications] = useState<Classification[]>([]);
  const [classificationLevels, SetClassificationLevels] = useState<number[]>(
    []
  );
  const [classificationOk, SetClassificationOk] = useState<boolean>(false);
  const [numberOfSolutions, SetNumberOfSolutions] = useState<number>(1);
  const [newSolutions, SetNewSolutions] = useState<ObjectiveData>();

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
          SetClassificationLevels(body.objective_names.map(() => 0.0));
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
          SetClassificationLevels(body.response.objective_values);
          SetNimbusState("classification");
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
    console.log(nimbusState);

    switch (nimbusState) {
      case "classification": {
        if (!classificationOk) {
          // classification not ok, do nothing
          break;
        }
        try {
          const res = await fetch(`${apiUrl}/method/control`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              response: {
                classifications: classifications,
                levels: classificationLevels,
                number_of_solutions: numberOfSolutions,
              },
            }),
          });

          if (res.status === 200) {
            // ok
            const body = await res.json();
            const response = JSON.parse(body.response);
            SetNewSolutions(
              ParseSolutions(response.objectives, activeProblemInfo!)
            );
            SetNimbusState("archive");
            break;
          } else {
            // not ok
            console.log(`Got response code ${res.status}`);
            // do nothing
            break;
          }
        } catch (e) {
          console.log("Could not iterate NIMBUS");
          console.log(e);
          // do nothing
          break;
        }
      }
      default: {
        console.log("Default case");
        break;
      }
    }

    SetLoading(false);
    console.log("done!");
  };

  const checkClassifications = useEffect(() => {
    if (nimbusState === "not started") {
      // do nothing if not started
      return;
    }
    const improve =
      classifications.includes("<" as Classification) ||
      classifications.includes("<=" as Classification);
    const worsen =
      classifications.includes(">=" as Classification) ||
      classifications.includes("0" as Classification);

    if (!improve) {
      SetHelpMessage(
        "Check classifications: at least one objective should be improved."
      );
      SetClassificationOk(false);
      return;
    } else if (!worsen) {
      SetHelpMessage(
        "Check classifications: at least one objective should be allowed to worsen."
      );
      SetClassificationOk(false);
      return;
    } else {
      SetHelpMessage("Classifications ok!");
      SetClassificationOk(true);
      return;
    }
  }, [classifications]);

  const inferClassifications = (barSelection: number[]) => {
    const isDiff = barSelection.map((v, i) => {
      const res = Math.abs(v - preferredPoint[i]) < 1e-12 ? false : true;
      return res;
    });
    const levels = classificationLevels;
    const classes = barSelection.map((value, i) => {
      if (!isDiff[i]) {
        // no change, return old classification
        return classifications[i];
      }
      if (activeProblemInfo?.minimize[i] === 1) {
        // minimization
        if (value > preferredPoint[i]) {
          // selected value is greater than currently preferred (worse)
          // Worsen until
          levels[i] = barSelection[i];
          return ">=" as Classification;
        } else if (value < preferredPoint[i]) {
          // selected value is less than currently preferred (better)
          // improve until
          levels[i] = barSelection[i];
          return "<=" as Classification;
        } else {
          // no change, keep as it is
          return classifications[i];
        }
      } else if (activeProblemInfo?.minimize[i] === -1) {
        // maximization
        if (value > preferredPoint[i]) {
          // selected value is greater than currently preferred (better)
          // improve until
          levels[i] = barSelection[i];
          return "<=" as Classification;
        } else if (value < preferredPoint[i]) {
          // selected value is less than currently preferred (worse)
          // worsen until
          levels[i] = barSelection[i];
          return ">=" as Classification;
        } else {
          // no change, keep as it is
          return classifications[i];
        }
      } else {
        // something went wrong, return previous classification
        console.log("Encountered something strange in inferClassifications...");
        return classifications[i];
      }
    });
    SetClassificationLevels(levels);
    SetClassifications(classes);
  };

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
          <p>{helpMessage}</p>
          <p>{classifications}</p>
          <p>{classificationLevels}</p>
          <Button block={true} size={"lg"} onClick={iterate}>
            Iterate
          </Button>
          <p>Current classifications</p>
        </Col>
        <Col sm={4}></Col>
      </Row>
      {nimbusState === "not started" && <div>Method not started yet</div>}
      {nimbusState === "classification" && (
        <>
          <Row>
            <Col sm={4}>
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column sm="12">
                    Desired number of solutions
                  </Form.Label>
                  <Col sm={12}>
                    <Form.Check
                      inline
                      label="1"
                      type="radio"
                      value={1}
                      checked={numberOfSolutions === 1 ? true : false}
                      onClick={() => SetNumberOfSolutions(1)}
                    />
                    <Form.Check
                      inline
                      label="2"
                      type="radio"
                      value={2}
                      checked={numberOfSolutions === 2 ? true : false}
                      onClick={() => SetNumberOfSolutions(2)}
                    />
                    <Form.Check
                      inline
                      label="3"
                      type="radio"
                      value={3}
                      checked={numberOfSolutions === 3 ? true : false}
                      onClick={() => SetNumberOfSolutions(3)}
                    />
                    <Form.Check
                      inline
                      label="4"
                      type="radio"
                      value={4}
                      checked={numberOfSolutions === 4 ? true : false}
                      onClick={() => SetNumberOfSolutions(4)}
                    />
                  </Col>
                </Form.Group>
              </Form>
              <ClassificationsInputForm
                setClassifications={SetClassifications}
                setClassificationLevels={SetClassificationLevels}
                classifications={classifications}
                classificationLevels={classificationLevels}
                currentPoint={preferredPoint}
                nObjectives={activeProblemInfo.nObjectives}
                objectiveNames={activeProblemInfo.objectiveNames}
                ideal={activeProblemInfo.ideal}
                nadir={activeProblemInfo.nadir}
                directions={activeProblemInfo.minimize}
              />
            </Col>
            <Col sm={8}>
              <HorizontalBars
                objectiveData={ParseSolutions(
                  [preferredPoint],
                  activeProblemInfo
                )}
                referencePoint={classificationLevels}
                currentPoint={preferredPoint}
                setReferencePoint={inferClassifications}
              />
            </Col>
          </Row>
        </>
      )}
      {nimbusState === "archive" && (
        <>
          <Row>
            <Col sm={4}></Col>
            <Col sm={4}>
              <SolutionTable
                objectiveData={newSolutions!}
                setSolution={() => console.log("selected")}
              />
            </Col>
            <Col sm={4}></Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default NimbusMethod;