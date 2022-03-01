import React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  ProblemInfo,
  ObjectiveData,
  ObjectiveDatum,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import ClassificationsInputForm from "../components/ClassificationsInputForm";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  ListGroup,
  FormGroup,
} from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import { HorizontalBars, ParallelAxes } from "desdeo-components";
import SolutionTable from "../components/SolutionTable";
import SolutionTableMultiSelect from "../components/SolutionTableMultiSelect";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { RSA_X931_PADDING } from "constants";

interface InitializationFormData {
  selectedNumOfPoints: number;
  selectedNumOfIterations: number;
}

interface NimbusMethodProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
  methodCreated: boolean;
  activeProblemId: number | null;
}

function ENautilusMethod({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
  methodCreated,
  activeProblemId,
}: NimbusMethodProps) {
  const [isInitialized, SetIsInitialized] = useState<boolean>(false);
  const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [numOfIterations, SetNumOfIterations] = useState<number>(-1);
  const [numOfPoints, SetNumOfPoint] = useState<number>(-1);
  const [loading, SetLoading] = useState<boolean>(false);
  const [methodStarted, SetMethodStarted] = useState<boolean>(false);

  const { register, handleSubmit, errors } = useForm<InitializationFormData>({
    mode: "onSubmit",
    defaultValues: { selectedNumOfPoints: 5, selectedNumOfIterations: 10 },
  });

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
          console.log(body.response);
          SetMethodStarted(true);
        }
      } catch (e) {
        console.log("not ok, could not start the method");
        console.log(`${e}`);
      }
    };

    startMethod();
    console.log("method started!");
  }, [activeProblemInfo, methodStarted]);

  function onSubmitInitialize(data: InitializationFormData) {
    const initialize = async () => {
      SetLoading(true);

      // get the initial request
      try {
        const res = await fetch(`${apiUrl}/method/control`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: {
              n_iterations: data.selectedNumOfIterations,
              n_points: data.selectedNumOfPoints,
            },
          }),
        });

        if (res.status == 200) {
          const body = await res.json();
          const response = body.response;
          console.log(response);
        } else {
          console.log("Res status is not 200");
          // do nothing
        }
      } catch (e) {
        console.log("not ok");
        console.log(e);
        // do nothing
      }

      SetLoading(false);
    };
    initialize();
  }

  if (fetchedInfo && !isInitialized) {
    return (
      <Container>
        <Row>
          <Col sm={12}>
            <Form action="" onSubmit={handleSubmit(onSubmitInitialize)}>
              <Form.Group>
                <Row>
                  <Col sm={2}></Col>
                  <Col sm={3}>
                    <Form.Label column="sm" key="lableofiterations">
                      Number of iterations
                    </Form.Label>
                    <Form.Control
                      key="controlofiterations"
                      name="selectedNumOfIterations"
                      ref={register({
                        required: true,
                        valueAsNumber: true,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Input must be a positive integer.",
                        },
                        min: {
                          value: 1,
                          message: "Minimum number of iterations is 1.",
                        },
                      })}
                    ></Form.Control>
                    <ErrorMessage
                      errors={errors}
                      name={"selectedNumOfIterations"}
                      render={({ message }) => <p>{message}</p>}
                    ></ErrorMessage>
                  </Col>
                  <Col sm={2}></Col>
                  <Col sm={3}>
                    <Form.Label column="sm" key="lableofpoints">
                      Number of intermediate points
                    </Form.Label>
                    <Form.Control
                      key="controlofpoints"
                      name="selectedNumOfPoints"
                      ref={register({
                        required: true,
                        valueAsNumber: true,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Input must be a positive integer.",
                        },
                        min: {
                          value: 2,
                          message: "Minimun number of points is 2.",
                        },
                      })}
                    ></Form.Control>
                    <ErrorMessage
                      errors={errors}
                      name={"selectedNumOfPoints"}
                      render={({ message }) => <p>{message}</p>}
                    ></ErrorMessage>
                  </Col>
                  <Col sm={2}></Col>
                </Row>
              </Form.Group>
              <Row>
                <Col sm={4}></Col>
                <Col sm={4}>
                  <Button block={true} size={"lg"} type="submit">
                    Continue
                  </Button>
                </Col>
                <Col sm={4}></Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  } else {
    return (
      <>
        <p>Something went wrong.</p>
      </>
    );
  }
}

export default ENautilusMethod;
