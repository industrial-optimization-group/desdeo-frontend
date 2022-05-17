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
import SolutionTableNautilus from "../components/SolutionTableNautilus";
import QuestionsModal from "../components/QuestionsModal";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Link } from "react-router-dom";
import { LogInfoToDB } from "../utils/Logging";

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
  // const [isFirstIteration, SetIsFirstIteration] = useState<boolean>(true);
  const [nIteration, SetNIteration] = useState<number>(0);
  const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  const [finalVariables, SetFinalVariables] = useState<number[]>([]);
  const [helpText, SetHelpText] = useState<string>("Help text");

  // State variables for iterating the method
  const [numOfIterations, SetNumOfIterations] = useState<number>(-1);
  const [numOfPoints, SetNumOfPoints] = useState<number>(-1);
  const [preferredPointIndex, SetPreferredPointIndex] = useState<number>(-1);
  const [changeRemaining, SetChangeRemaining] = useState<boolean>(false);
  const [newIterationsLeft, SetNewIterationsLeft] = useState<number>(-1);
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
    defaultValues: { selectedNumOfPoints: 4, selectedNumOfIterations: 5 },
  });

  // Hooks realted to the questionnaires
  const [showQEndMethod, SetShowQEndMethod] = useState<boolean>(false);
  const [endMethodQSuccess, SetEndMethodQSuccess] = useState<boolean>(false);
  const [showQAfterIteration, SetShowQAfterIteration] =
    useState<boolean>(false);
  const [showQAfterNew, SetShowQAfterNew] = useState<boolean>(false);

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
          SetNIteration(1);
          SetMethodStarted(true);
          SetHelpText(
            "Select a desired number of iterations and a desired number of intermediate points to be shown in each iteration."
          );
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Info",
            "",
            "User started the E-NAUTILUS method."
          );
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
          SetHelpText("Select the most preferred intermediate point.");
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Preference",
            `{"Number of iterations": ${data.selectedNumOfIterations}, "Number of intermediate points": ${data.selectedNumOfPoints},}`,
            "User initialized E-NAUTILUS."
          );
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

  const iterate = async (takeStepBack: boolean = false) => {
    console.log("iterate");
    SetLoading(true);

    try {
      let payload = {};
      if (takeStepBack) {
        const prevIterationsState =
          prevIterationsStates[prevIterationsStates.length - 1];
        payload = {
          response: {
            preferred_point_index: prevIterationsState.prefPointIndex,
            change_remaining: changeRemaining,
            step_back: takeStepBack,
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
            step_back: takeStepBack,
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

        if (takeStepBack) {
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
            SetHelpText("Select the most preferred intermediate point.");
          } else {
            // first iteration, nadir as previous best
            console.log(activeProblemInfo?.nadir!);
            SetPrevPrefPoint(activeProblemInfo?.nadir!);
          }
          SetCurrentIterationState(currentState);
          SetNumOfIterations(response.n_iterations_left);
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Info",
            "",
            "User took a step back in E-NAUTILUS."
          );
        } else if (numOfIterations === 1) {
          // last iteration
          SetFinalObjectives(response.objective);
          SetFinalVariables(response.solution);
          console.log(`Final solution: ${response.solution}`);
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Preference",
            `{"Intermediate point selected": [${
              currentIterationState.points[preferredPointIndex]
            }], "Selected point index": ${preferredPointIndex}, "Intermediate points": ${JSON.stringify(
              currentIterationState.points
            )}, "Lower bounds": ${JSON.stringify(
              currentIterationState.lowerBounds
            )}, "Upper bounds": ${JSON.stringify(
              currentIterationState.upperBounds
            )}, "Distances": ${JSON.stringify(
              currentIterationState.distances
            )}, "Iterations left": ${numOfIterations}, "Changed remaining iterations": ${changeRemaining},}`,
            "User iterated E-NAUTILUS."
          );
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Final solution",
            `{"Objective values": [${response.objective}], "Variable values": [${response.solution}]}`,
            "User reached the final solution in E-NAUTILUS."
          );
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
          SetNumOfIterations(response.n_iterations_left);
          SetHelpText("Select the most preferred intermediate point.");

          if (nIteration === 1 || nIteration === 4) {
            SetShowQAfterIteration(true);
          }
          SetNIteration(nIteration + 1);

          await LogInfoToDB(
            tokens,
            apiUrl,
            "Preference",
            `{"Intermediate point selected": [${
              currentIterationState.points[preferredPointIndex]
            }], "Selected point index": ${preferredPointIndex}, "Intermediate points": ${JSON.stringify(
              currentIterationState.points
            )}, "Lower bounds": ${JSON.stringify(
              currentIterationState.lowerBounds
            )}, "Upper bounds": ${JSON.stringify(
              currentIterationState.upperBounds
            )}, "Distances": ${JSON.stringify(
              currentIterationState.distances
            )}, "Iterations left": ${numOfIterations}, "Changed remaining iterations": ${changeRemaining},}`,
            "User iterated E-NAUTILUS."
          );

          SetCurrentIterationState(newState);
        }

        SetPreferredPointIndex(-1);
        SetChangeRemaining(false);
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
          <Col>
            <h3 className="mb-3">E-NAUTILUS method</h3>
            <p>{`Help: ${helpText}`}</p>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Form action="" onSubmit={handleSubmitInit(onSubmitInitialize)}>
              <Form.Group>
                <Row>
                  <Col sm={1}></Col>
                  <Col sm={4}>
                    <Form.Label column="lg" key="lableofiterations">
                      Number of iterations
                    </Form.Label>
                    <Form.Select
                      size={"lg"}
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
                    >
                      <option value={"4"}>{"4"}</option>
                      <option value={"5"}>{"5"}</option>
                      <option value={"6"}>{"6"}</option>
                      <option value={"7"}>{"7"}</option>
                    </Form.Select>
                    <ErrorMessage
                      errors={errorsInit}
                      name={"selectedNumOfIterations"}
                      render={({ message }) => <p>{message}</p>}
                    ></ErrorMessage>
                  </Col>
                  <Col sm={2}></Col>
                  <Col sm={4}>
                    <Form.Label column="lg" key="lableofpoints">
                      Number of intermediate points
                    </Form.Label>
                    <Form.Select
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
                    >
                      <option value={"2"}>{"2"}</option>
                      <option value={"3"}>{"3"}</option>
                      <option value={"4"}>{"4"}</option>
                      <option value={"5"}>{"5"}</option>
                      <option value={"6"}>{"6"}</option>
                      <option value={"7"}>{"7"}</option>
                    </Form.Select>
                    <ErrorMessage
                      errors={errorsInit}
                      name={"selectedNumOfPoints"}
                      render={({ message }) => <p>{message}</p>}
                    ></ErrorMessage>
                  </Col>
                  <Col sm={1}></Col>
                </Row>
              </Form.Group>
              <Row>
                <Col sm={4}></Col>
                <Col sm={4}>
                  <Button size={"lg"} type="submit">
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
            <h3 className="mb-3">{`E-NAUTILUS method: iterations left ${numOfIterations}`}</h3>
            <p>{`Help: ${helpText}`}</p>
          </Col>
        </Row>
        <Row>
          <Col sm={4}>
            <Button
              size={"lg"}
              id={"step-back-btn"}
              disabled={prevIterationsStates.length < 1 || changeRemaining}
              onClick={() => {
                iterate(true);
              }}
            >
              {"← Step back"}
            </Button>
          </Col>
          <Col sm={4}>
            {preferredPointIndex === -1 && (
              <Button size={"lg"} disabled={true} variant={"info"}>
                {"Select a point to iterate"}
              </Button>
            )}
            {preferredPointIndex >= 0 && (
              <Button size={"lg"} onClick={() => iterate()} disabled={loading}>
                {loading
                  ? "Loading..."
                  : changeRemaining
                  ? "Change iterations and iterate"
                  : numOfIterations === 1
                  ? "Select final solution and stop"
                  : "Iterate"}
              </Button>
            )}
          </Col>
          <Col sm={4}>
            <Button
              size={"lg"}
              id={"change-remaining-btn"}
              onClick={() => {
                SetChangeRemaining(!changeRemaining);
                if (!changeRemaining) {
                  SetHelpText("Input a new number of iterations.");
                } else {
                  SetHelpText("Select the most preferred intermediate point.");
                }
              }}
            >
              {!changeRemaining ? "Change number of iterations" : "Cancel"}
            </Button>
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
          </Col>
        </Row>
        <Row className="mb-2">
          <Col sm={2}></Col>
          <Col>
            <h4>{"Select next candidate"}</h4>
          </Col>
          <Col sm={2}></Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Container fluid>
              <Row className="jusify-content-center">
                <Col>
                  <ParallelAxes
                    objectiveData={ToTrueValues(
                      ParseSolutions(
                        currentIterationState.points,
                        activeProblemInfo!
                      )
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
                    dimensionsMaybe={{
                      chartHeight: 700,
                      chartWidth: 850,
                      marginLeft: 0,
                      marginRight: 0,
                      marginTop: 30,
                      marginBottom: 0,
                    }}
                  />
                </Col>
              </Row>
            </Container>
          </Col>
          <Col sm={6}>
            <SolutionTable
              objectiveData={ParseSolutions(
                currentIterationState.points,
                activeProblemInfo!
              )}
              setIndex={(x: number) => SetPreferredPointIndex(x)}
              selectedIndex={preferredPointIndex}
              tableTitle={""}
            />
          </Col>
        </Row>
        <Row className="mt-5">
          <SolutionTableNautilus
            objectiveData={ParseSolutions(
              currentIterationState.points,
              activeProblemInfo!
            )}
            setIndex={(x: number) => SetPreferredPointIndex(x)}
            selectedIndex={preferredPointIndex}
            tableTitle={"Lower (LB) and upper (UB) bounds and distances"}
            lowerBounds={currentIterationState.lowerBounds}
            upperBounds={currentIterationState.upperBounds}
            distances={currentIterationState.distances}
          />
        </Row>
        {showQAfterIteration && (
          <QuestionsModal
            apiUrl={apiUrl}
            tokens={tokens}
            description={`After iteration ${nIteration} in the E-NAUTILUS method.`}
            questionnaireType="During"
            nIteration={nIteration}
            handleSuccess={(isSuccess) => {
              SetShowQAfterIteration(!isSuccess);
              SetShowQAfterNew(isSuccess);
            }}
            show={showQAfterIteration}
            questionnaireTitle={`Questoins after iterating ${nIteration} times`}
          />
        )}
        {showQAfterNew && (
          <QuestionsModal
            apiUrl={apiUrl}
            tokens={tokens}
            description={`After showing new intermediate points in iteration ${nIteration} in E-NAUTILUS method.`}
            questionnaireType={"NewSolutions"}
            nIteration={nIteration}
            handleSuccess={(isSuccess) => {
              SetShowQAfterNew(!isSuccess);
            }}
            show={showQAfterNew}
            questionnaireTitle={`Questions after computing new intermediate points`}
          />
        )}
      </Container>
    );
  } else if (numOfIterations === 0) {
    return (
      <Container>
        <h3 className="mb-3">E-NAUTILUS method</h3>
        <SolutionTable
          objectiveData={ParseSolutions([finalObjectives], activeProblemInfo!)}
          setIndex={() => {
            return;
          }}
          selectedIndex={0}
          tableTitle={"Final objective values"}
        />
        <p>{"Final decision variable values"}</p>
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
        {!endMethodQSuccess && (
          <Button onClick={() => SetShowQEndMethod(!showQEndMethod)}>
            Answer questionnaire
          </Button>
        )}
        {endMethodQSuccess && (
          <Link to={"/finish"}>
            <Button>{"Finish"}</Button>
          </Link>
        )}
        <QuestionsModal
          apiUrl={apiUrl}
          tokens={tokens}
          description="Questions asked at the end of iterating the E-NAUTILUS method."
          questionnaireType="After"
          nIteration={nIteration}
          handleSuccess={(isSuccess) => {
            SetShowQEndMethod(!isSuccess);
            SetEndMethodQSuccess(isSuccess);
          }}
          show={showQEndMethod}
          questionnaireTitle={"After E-NAUTILUS questions"}
        />
      </Container>
    );
  } else {
    return <p>...</p>;
  }
}

export default ENautilusMethod;
