import { useEffect, useState } from "react";
import { ProblemInfo } from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  FormGroup,
} from "react-bootstrap";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import { ParallelAxes } from "desdeo-components";
import SolutionTable from "../components/SolutionTable";
import QuestionsModal from "../components/QuestionsModal";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

interface FormData {
  selectedNumOfPoints: number;
  selectedNumOfIterations: number;
}

interface IterationState {
  points: number[][];
  upperBounds: number[][];
  lowerBounds: number[][];
  distances: number[];
  iterationsLeft: number;
  prefPointIndex: number;
}

interface EnautilusMethodProps {
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
}: EnautilusMethodProps) {
  // General state variables to keep track of the current state of the method
  const [isInitialized, SetIsInitialized] = useState<boolean>(false);
  const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);
  const [methodStarted, SetMethodStarted] = useState<boolean>(false);
  const [isFirstIteration, SetIsFirstIteration] = useState<boolean>(true);
  const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  const [finalVariables, SetFinalVariables] = useState<number[]>([]);

  // State variables for iterating the method
  const [numOfIterations, SetNumOfIterations] = useState<number>(-1);
  const [numOfPoints, SetNumOfPoints] = useState<number>(-1);
  const [preferredPointIndex, SetPreferredPointIndex] = useState<number>(-1);
  const [changeRemaining, SetChangeRemaining] = useState<boolean>(false);
  const [newIterationsLeft, SetNewIterationsLeft] = useState<number>(-1);
  const [stepBack, SetStepBack] = useState<boolean>(false);
  const [prevPrefPoint, SetPrevPrefPoint] = useState<number[]>([]);
  const [currentIterationState, SetCurrentIterationState] =
    useState<IterationState>({
      points: [[]],
      upperBounds: [[]],
      lowerBounds: [[]],
      distances: [],
      iterationsLeft: -1,
      prefPointIndex: -1,
    });

  // Keeping track of the previous iteration so that stepping back is possible
  const [prevIterationsStates, SetPrevIterationStates] = useState<
    IterationState[]
  >([]);

  // Form hooks and state variables
  const {
    register: registerInit,
    handleSubmit: handleSubmitInit,
    errors: errorsInit,
  } = useForm<FormData>({
    mode: "onSubmit",
    defaultValues: { selectedNumOfPoints: 5, selectedNumOfIterations: 10 },
  });

  const {
    register: registerIter,
    handleSubmit: handleSubmitIter,
    errors: errorsIter,
  } = useForm<FormData>({
    mode: "onChange",
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

  function onSubmitInitialize(data: FormData) {
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
          // initialization successful
          const body = await res.json();
          const response = body.response;

          SetNumOfIterations(data.selectedNumOfIterations);
          SetNumOfPoints(data.selectedNumOfPoints);

          SetCurrentIterationState({
            points: response.points,
            lowerBounds: response.lower_bounds,
            upperBounds: response.upper_bounds,
            iterationsLeft: response.n_iterations_left,
            distances: response.distances,
            prefPointIndex: -1,
          });

          SetPrevPrefPoint(response.nadir);

          SetIsInitialized(true);
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

  const iterate = async () => {
    console.log("iterate");
    SetLoading(true);

    try {
      let payload = {};
      if (stepBack) {
        const prevIterationsState =
          prevIterationsStates[prevIterationsStates.length - 1];
        payload = {
          response: {
            preferred_point_index: prevIterationsState.prefPointIndex,
            change_remaining: changeRemaining,
            step_back: stepBack,
            iterations_left: prevIterationsState.iterationsLeft,
            prev_solutions: prevIterationsState.points,
            prev_lower_bounds: prevIterationsState.lowerBounds,
            prev_upper_bounds: prevIterationsState.upperBounds,
            prev_distances: prevIterationsState.distances,
          },
        };
      } else {
        payload = {
          response: {
            preferred_point_index: preferredPointIndex,
            change_remaining: changeRemaining,
            step_back: stepBack,
            iterations_left: newIterationsLeft,
          },
        };
      }
      const res = await fetch(`${apiUrl}/method/control`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        // iteration successful
        const body = await res.json();
        const response = body.response;

        if (stepBack) {
          // Pop the last state
          const statesCopy = prevIterationsStates;
          const prevState = statesCopy.pop();
          console.log(`pref point index ${prevState?.prefPointIndex}`);
          SetPrevIterationStates(statesCopy);

          const currentState = {
            points: response.points,
            lowerBounds: response.lower_bounds,
            upperBounds: response.upper_bounds,
            iterationsLeft: response.n_iterations_left,
            distances: response.distances,
            prefPointIndex: prevState?.prefPointIndex!,
          };

          // Update previous pref point
          if (statesCopy.length > 0) {
            console.log(
              statesCopy[statesCopy.length - 1].points[
                prevState!.prefPointIndex
              ]
            );
            SetPrevPrefPoint(
              statesCopy[statesCopy.length - 1].points[
                prevState!.prefPointIndex
              ]
            );
          } else {
            // first iteration, nadir as previous best
            console.log(activeProblemInfo?.nadir!);
            SetPrevPrefPoint(activeProblemInfo?.nadir!);
          }
          SetCurrentIterationState(currentState);
          SetNumOfIterations(response.n_iterations_left);
        } else if (numOfIterations === 1) {
          // last iteration
          SetFinalObjectives(response.objective);
          SetFinalVariables(response.solution);
          console.log(`Final solution: ${response.solution}`);
          SetNumOfIterations(0);
        } else {
          // iterate normally
          // add the current state to the previous states
          SetPrevIterationStates(
            prevIterationsStates.concat(currentIterationState)
          );

          // new state
          const newState = {
            points: response.points,
            lowerBounds: response.lower_bounds,
            upperBounds: response.upper_bounds,
            iterationsLeft: response.n_iterations_left,
            distances: response.distances,
            prefPointIndex: preferredPointIndex,
          };

          // Update previous solution
          SetPrevPrefPoint(currentIterationState.points[preferredPointIndex]);

          // Update current state with the new state
          SetCurrentIterationState(newState);
          SetNumOfIterations(response.n_iterations_left);
        }

        SetPreferredPointIndex(-1);
        SetChangeRemaining(false);
        SetStepBack(false);
      } else {
        console.log(`iteration not ok, got response ${res.status}`);
      }
    } catch (e) {
      console.log("something went wrong");
      console.log(e);
      // do nothing
    }

    SetLoading(false);
  };

  function onIterChange(data: FormData) {
    SetNewIterationsLeft(data.selectedNumOfIterations);
  }

  if (fetchedInfo && !isInitialized) {
    return (
      <Container>
        <Row>
          <Col sm={12}>
            <Form action="" onSubmit={handleSubmitInit(onSubmitInitialize)}>
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
                      ref={registerInit({
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
                      errors={errorsInit}
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
                      ref={registerInit({
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
                      errors={errorsInit}
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
  } else if (fetchedInfo && isInitialized && numOfIterations > 0) {
    return (
      <Container>
        <Row>
          <Col>
            <h3 className="mb-3">E-NAUTILUS method</h3>
            <p>Help: do stuff</p>
          </Col>
        </Row>
        <Row>
          <Col sm={4}></Col>
          <Col sm={4}>
            {preferredPointIndex === -1 && !stepBack && (
              <Button block={true} size={"lg"} disabled={true} variant={"info"}>
                Select a point first
              </Button>
            )}
            {preferredPointIndex >= 0 && !stepBack && (
              <Button
                block={true}
                size={"lg"}
                onClick={iterate}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : changeRemaining
                  ? "Change iterations and iterate"
                  : numOfIterations === 1
                  ? "Select final solution and stop"
                  : "Iterate"}
              </Button>
            )}
            {stepBack && (
              <Button
                block={true}
                size={"lg"}
                onClick={iterate}
                disabled={loading}
              >
                {loading ? "Loading..." : "Step back"}
              </Button>
            )}
          </Col>
          <Col sm={4}></Col>
        </Row>
        <Row>
          <Col sm={2}></Col>
          <Col>
            <h4 className="mt-4">{`Iterations left ${numOfIterations}`}</h4>
          </Col>
          <Col sm={2}></Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={8} className={"mt-2"}>
                  {"Change the number of remaining iterations?"}
                </Form.Label>
                <Col sm={3}>
                  <Form.Check
                    className={"mt-3"}
                    id="remaining-switch"
                    type="switch"
                    disabled={stepBack}
                    label={
                      changeRemaining ? (
                        <>
                          {"no/"}
                          <b>{"yes"}</b>
                        </>
                      ) : (
                        <>
                          <b>{"no"}</b>
                          {"/yes"}
                        </>
                      )
                    }
                    checked={changeRemaining}
                    onChange={() => SetChangeRemaining(!changeRemaining)}
                  />
                </Col>
                <Form.Label column sm={8} className={"mt-2"}>
                  {"Go to previous iteration?"}
                </Form.Label>
                <Col sm={3}>
                  <Form.Check
                    className={"mt-3"}
                    id="stepback-switch"
                    type="switch"
                    disabled={prevIterationsStates.length < 1}
                    label={
                      stepBack ? (
                        <>
                          {"no/"}
                          <b>{"yes"}</b>
                        </>
                      ) : (
                        <>
                          <b>{"no"}</b>
                          {"/yes"}
                        </>
                      )
                    }
                    checked={stepBack}
                    onChange={() => SetStepBack(!stepBack)}
                  />
                </Col>
              </Form.Group>
            </Form>
            <ParallelAxes
              objectiveData={ToTrueValues(
                ParseSolutions(currentIterationState.points, activeProblemInfo!)
              )}
              selectedIndices={
                preferredPointIndex === -1 ? [] : [preferredPointIndex]
              }
              handleSelection={(x: number[]) => {
                x.length > 0
                  ? SetPreferredPointIndex(x.pop()!)
                  : SetPreferredPointIndex(preferredPointIndex);
              }}
              oldAlternative={ToTrueValues(
                ParseSolutions([prevPrefPoint], activeProblemInfo!)
              )}
            />
          </Col>
          <Col sm={6}>
            <Row className={changeRemaining ? "visible" : "invisible"}>
              <Form action="" onChange={handleSubmitIter(onIterChange)}>
                <FormGroup as={Row}>
                  <Form.Label column sm={8} className={"mt-2"}>
                    {"New number of iterations:"}
                  </Form.Label>
                  <Col sm={3} className={"mt-2"}>
                    <Form.Control
                      key="controlofnewiter"
                      name="selectedNumOfIterations"
                      defaultValue={numOfIterations}
                      ref={registerIter({
                        required: true,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Input must be a positive integer.",
                        },
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message:
                            "Number of iterations must be greater than 1",
                        },
                      })}
                    />
                    <ErrorMessage
                      errors={errorsIter}
                      name={"selectedNumOfIterations"}
                      render={({ message }) => <p>{message}</p>}
                    ></ErrorMessage>
                  </Col>
                </FormGroup>
              </Form>
            </Row>
            <SolutionTable
              objectiveData={ParseSolutions(
                currentIterationState.points,
                activeProblemInfo!
              )}
              setIndex={(x: number) => SetPreferredPointIndex(x)}
              selectedIndex={preferredPointIndex}
              tableTitle={"Intermediate points"}
            />
          </Col>
        </Row>
      </Container>
    );
  } else if (numOfIterations === 0) {
    return (
      <Container>
        <SolutionTable
          objectiveData={ParseSolutions([finalObjectives], activeProblemInfo!)}
          setIndex={() => {
            return;
          }}
          selectedIndex={0}
          tableTitle={"Final objective values"}
        />
        <p>{"Final decision variable values:"}</p>
        <Table striped bordered hover>
          <thead>
            <tr>
              {finalVariables.map((_, i) => {
                return <th>{`x${i + 1}`}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {finalVariables.map((v) => {
                return <td>{`${v.toFixed(4)}`}</td>;
              })}
            </tr>
          </tbody>
        </Table>
        <QuestionsModal
          apiUrl={apiUrl}
          tokens={tokens}
          description="Testing"
          questionnaireType="After"
        />
      </Container>
    );
  } else {
    return <p>...</p>;
  }
}

export default ENautilusMethod;
