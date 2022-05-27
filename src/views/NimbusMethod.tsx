import { useEffect, useState } from "react";
import { ProblemInfo, ObjectiveData } from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import ClassificationsInputForm from "../components/ClassificationsInputForm";
import { Container, Row, Col, Button, Form, Table } from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import { HorizontalBars, ParallelAxes } from "desdeo-components";
import SolutionTable from "../components/SolutionTable";
import SolutionTableNimbus from "../components/SolutionTableNimbus";
import { SolutionTableMultiSelect } from "../components/SolutionTableMultiSelect";
import { Link } from "react-router-dom";
import { LogInfoToDB } from "../utils/Logging";
import QuestionsModal from "../components/QuestionsModal";

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
  | "classify preferred"
  | "stop with preferred"
  | "select preferred"
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
  const [currentState, SetCurrentState] = useState<NimbusState>("not started");
  const [classifications, SetClassifications] = useState<Classification[]>([]);
  const [classificationLevels, SetClassificationLevels] = useState<number[]>(
    []
  );
  const [classificationOk, SetClassificationOk] = useState<boolean>(false);
  const [numberOfSolutions, SetNumberOfSolutions] = useState<number>(1);
  const [newSolutions, SetNewSolutions] = useState<ObjectiveData>();
  const [archivedSolutions, SetArchivedSolutions] = useState<ObjectiveData>();
  const [selectedIndices, SetSelectedIndices] = useState<number[]>([]);
  const [selectedIndexArchive, SetSelectedIndexArchive] = useState<number>(-1);
  const [nSolutionsInArchive, SetNSolutionsInArchive] = useState<number>(0);
  const [finalVariables, SetFinalVariables] = useState<number[]>([]);
  const [nIteration, SetNIteration] = useState<number>(0);
  const [
    solutionsArchivedAfterClassification,
    SetSolutionsArchivedAfterClassification,
  ] = useState<boolean>(false);
  const [newSolutionTableOffset, SetNewSolutionTableOffset] =
    useState<number>(0);

  // related to quesionnaires
  const [showQAfterIterate, SetShowQAfterIterate] = useState<boolean>(false);
  const [showQAfterNew, SetShowQAfterNew] = useState<boolean>(false);
  const [showQEndMethod, SetShowQEndMethod] = useState<boolean>(false);
  const [afterQEndMethodSuccess, SetAfterQEndMethodSuccess] =
    useState<boolean>(false);

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
          SetMethodStarted(true);
          SetPreferredPoint([...body.response.objective_values]); // make copy to avoid aliasing
          SetClassificationLevels(body.response.objective_values);
          SetHelpMessage("Please classify each of the shown objectives.");
          SetCurrentState("classification");
          await LogInfoToDB(
            tokens,
            apiUrl,
            "Info",
            "",
            "User started the NIMBUS method."
          );
          SetNIteration(1);
        }
      } catch (e) {
        console.log("not ok, could not start the method");
        console.log(`${e}`);
      }
    };

    startMethod();
  }, [activeProblemInfo, methodStarted]);

  const iterate = async (nimbusState: NimbusState = "classification") => {
    // Attempt to iterate
    SetLoading(true);

    switch (nimbusState) {
      case "classification": {
        // CLASSIFICATION!
        if (!classificationOk) {
          // classification not ok, do nothing
          SetHelpMessage(
            "Check the given classifications. Something must be allowed to improve and something must be allowed to worsen."
          );
          break;
        }
        try {
          console.log(`iterating with levels ${classificationLevels}`);
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
            await LogInfoToDB(
              tokens,
              apiUrl,
              "Preference",
              `{"Current solution": ${JSON.stringify(
                preferredPoint
              )}, "Iteration": ${nIteration}, "Classification": ${JSON.stringify(
                classifications
              )}, "Levels": ${JSON.stringify(
                classificationLevels
              )}, "Number of new solutions": ${JSON.stringify(
                numberOfSolutions
              )}}`,
              "User provided classifications in NIMBUS."
            );
            const body = await res.json();
            const response = body.response;
            SetNewSolutions(
              ParseSolutions(response.objectives, activeProblemInfo!)
            );
            SetHelpMessage(
              "Select new solutions to be saved to an archive, or select the currently preferred solution for classification or to stop with."
            );

            SetCurrentState("archive");
            SetSolutionsArchivedAfterClassification(false);
            SetSelectedIndexArchive(-1);
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
      case "archive": {
        // ARCHIVE SOLUTIONS -> SELECT PREFERRED
        try {
          const res = await fetch(`${apiUrl}/method/control`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              response: {
                indices: selectedIndices,
              },
            }),
          });
          if (res.status === 200) {
            const body = await res.json();
            const response = body.response;

            const chosenNew =
              newSolutions !== undefined
                ? selectedIndices.map((i) => newSolutions.values[i].value)
                : [];

            await LogInfoToDB(
              tokens,
              apiUrl,
              "Info",
              `{"Solutions chosen": ${JSON.stringify(
                chosenNew
              )}, "Iteration": ${nIteration},}`,
              "Solutions chosen by the user to be saved to the archive in NIMBUS."
            );

            // update the solutions to be shown
            const toBeShown = ParseSolutions(
              response.objectives.slice(
                nSolutionsInArchive,
                nSolutionsInArchive + numberOfSolutions
              ),
              activeProblemInfo!
            );
            SetNewSolutions(toBeShown);

            SetHelpMessage("CHANGE ME!!!!");
            // SetNimbusState("intermediate");
            // SKIP INTERMEDIATE STEP
            try {
              const resArchive = await fetch(`${apiUrl}/method/control`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${tokens.access}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  response: {
                    indices: [],
                    number_of_desired_solutions: 0,
                  },
                }),
              });

              if (resArchive.status === 200) {
                // ok
                const bodyArchive = await resArchive.json();
                const responseArchive = bodyArchive.response;

                if (selectedIndices.length === 0) {
                  // do nothing
                } else {
                  // pick archived solutions
                  SetArchivedSolutions(
                    ParseSolutions(
                      responseArchive.objectives.slice(
                        0,
                        nSolutionsInArchive + selectedIndices.length
                      ),
                      activeProblemInfo!
                    )
                  );
                }

                SetHelpMessage(
                  "Please select the solution you prefer the most from the shown solutions. You must select only one solution to continue."
                );
                SetCurrentState("select preferred");
                SetSolutionsArchivedAfterClassification(true);
                // how many solutions are in the archive
                SetNSolutionsInArchive(
                  nSolutionsInArchive + selectedIndices.length
                );
                // reset the active selection
                SetSelectedIndices([]);
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
          } else {
            // not ok
            console.log(`Got response code ${res.status}`);
            // do nothing
            return;
          }
        } catch (e) {
          console.log("Could not iterate NIMBUS");
          console.log(e);
          // do nothing
          break;
        }
      }
      case "classify preferred":
      case "stop with preferred": {
        // SELECT PREFERRED -> STOP or CLASSIFICATION
        console.log("Selected index archive");
        console.log(selectedIndexArchive);
        console.log("Selected indices");
        console.log(selectedIndices);

        let index: number = 0;

        if (selectedIndices.length === 0 && selectedIndexArchive === -1) {
          SetHelpMessage("Please select a preferred solution first.");
          // do nothing;
          break;
        } else if (selectedIndices.length > 0) {
          index = selectedIndices[0] + newSolutionTableOffset;
        } else if (selectedIndexArchive !== -1) {
          index = selectedIndexArchive;
        } else {
          SetHelpMessage("Invalid selection.");
          // do nothin;
          break;
        }
        try {
          if (!solutionsArchivedAfterClassification) {
            // archive and intermediate steps need to be skipped, henche, empty indices
            const skipRes = await fetch(`${apiUrl}/method/control`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokens.access}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                response: {
                  indices: [],
                },
              }),
            });

            if (skipRes.status === 200) {
              // ok
            } else {
              console.log(
                `Could not skip archive, response code ${skipRes.status}`
              );
              // do nothing
              break;
            }

            const resInt = await fetch(`${apiUrl}/method/control`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokens.access}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                response: {
                  indices: [],
                  number_of_desired_solutions: 0,
                },
              }),
            });

            if (resInt.status === 200) {
              // ok
            } else {
              console.log(
                `Could not skip intermediate solutions, response code ${skipRes.status}`
              );
              // do nothing
              break;
            }
          }

          // else, continue normally
          const res = await fetch(`${apiUrl}/method/control`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              response: {
                index: index,
                continue: nimbusState === "classify preferred",
              },
            }),
          });

          if (res.status === 200) {
            // Ok
            const body = await res.json();
            const response = body.response;

            if (nimbusState === "classify preferred") {
              // continue iterating
              await LogInfoToDB(
                tokens,
                apiUrl,
                "Preference",
                `{"Preferred solution": ${JSON.stringify(
                  response.objective_values
                )}, "Iteration": ${nIteration},}`,
                "User chose a new preferred solution in NIMBUS."
              );

              SetPreferredPoint([...response.objective_values]); // avoid aliasing
              SetClassificationLevels(response.objective_values);
              SetClassifications(
                response.objective_values.map(() => "=" as Classification)
              );

              SetSelectedIndices([]);
              SetHelpMessage("Please classify each of the shown objectives.");
              SetCurrentState("classification");
              SetNIteration(nIteration + 1);
              // reset the number of solutions
              SetNumberOfSolutions(1);
              // update new solution table offset
              SetNewSolutionTableOffset(nSolutionsInArchive);
              break;
            } else {
              // stop iterating
              await LogInfoToDB(
                tokens,
                apiUrl,
                "Final solution",
                `{"Objective values": ${JSON.stringify(
                  response.objective
                )}, "Variable values": ${JSON.stringify(response.solution)},}`,
                "User reached the final solution in NIMBUS."
              );
              SetPreferredPoint(response.objective);
              SetFinalVariables(response.solution);
              SetHelpMessage("Stopped. Showing final solution reached.");
              SetCurrentState("stop");
              break;
            }
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
  };

  // only allow two selected indices at any given time in the 'intermediate' state, and one index at any given time in the
  //
  useEffect(() => {
    if (currentState === "select preferred") {
      if (selectedIndices.length === 1 || selectedIndices.length === 0) {
        // do nothing
        return;
      }
      SetSelectedIndices([selectedIndices[1]]);
      return;
    }
  }, [selectedIndices]);

  useEffect(() => {
    if (currentState === "not started") {
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
      const res =
        // The preferred point must be in the original scale to be compared with barSelection
        Math.abs(v - preferredPoint[i] * activeProblemInfo!.minimize[i]) < 1e-12
          ? false
          : true;
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
        // levels must be transformed back to original scale, hence the minus signs
        if (value > -1 * preferredPoint[i]) {
          // selected value is greater than currently preferred (better)
          // improve until
          levels[i] = -barSelection[i];
          return "<=" as Classification;
        } else if (value < -1 * preferredPoint[i]) {
          // selected value is less than currently preferred (worse)
          // worsen until
          levels[i] = -barSelection[i];
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
        <Col sm={12}>
          <h3>Synchronous NIMBUS</h3>
        </Col>
        <Col sm={2}></Col>
        <Col sm={8}>
          <p>{`Help: ${helpMessage}`}</p>
        </Col>
        <Col sm={4}></Col>
        <Col sm={4}>
          {!loading && currentState === "classification" && (
            <Button
              size={"lg"}
              onClick={() => {
                if (nIteration === 1 || nIteration === 4) {
                  SetShowQAfterIterate(true);
                } else {
                  iterate("classification");
                }
              }}
              disabled={!classificationOk}
            >
              {classificationOk ? "Iterate" : "Invalid classification"}
            </Button>
          )}
          {loading && (
            <Button disabled={true} size={"lg"} variant={"info"}>
              {"Working... "}
              <ReactLoading
                type={"bubbles"}
                color={"#ffffff"}
                className={"loading-icon"}
                height={28}
                width={32}
              />
            </Button>
          )}
        </Col>
        <Col sm={4}></Col>
      </Row>
      {currentState === "not started" && <div>Method not started yet</div>}
      {currentState === "classification" && (
        <>
          <Row>
            <Col sm={12}>
              <h4 className={"mt-3"}>{"Classification"}</h4>
            </Col>
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
                      onChange={() => SetNumberOfSolutions(1)}
                    />
                    <Form.Check
                      inline
                      label="2"
                      type="radio"
                      value={2}
                      checked={numberOfSolutions === 2 ? true : false}
                      onChange={() => SetNumberOfSolutions(2)}
                    />
                    <Form.Check
                      inline
                      label="3"
                      type="radio"
                      value={3}
                      checked={numberOfSolutions === 3 ? true : false}
                      onChange={() => SetNumberOfSolutions(3)}
                    />
                    <Form.Check
                      inline
                      label="4"
                      type="radio"
                      value={4}
                      checked={numberOfSolutions === 4 ? true : false}
                      onChange={() => SetNumberOfSolutions(4)}
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
              <div className={"mt-5"}>
                <HorizontalBars
                  objectiveData={ToTrueValues(
                    ParseSolutions([preferredPoint], activeProblemInfo)
                  )}
                  referencePoint={classificationLevels.map((v, i) =>
                    activeProblemInfo.minimize[i] === 1 ? v : -v
                  )}
                  currentPoint={preferredPoint.map((v, i) =>
                    activeProblemInfo.minimize[i] === 1 ? v : -v
                  )}
                  setReferencePoint={inferClassifications} // the reference point is passed in its true form to the callback
                  dimensionsMaybe={{
                    chartHeight: 400,
                    chartWidth: 800,
                    marginLeft: 0,
                    marginRight: 150,
                    marginTop: 0,
                    marginBottom: 30,
                  }}
                />
              </div>
            </Col>
          </Row>
        </>
      )}
      <>
        {showQAfterIterate && (
          <QuestionsModal
            apiUrl={apiUrl}
            tokens={tokens}
            description={`After providing classifications in iteration ${nIteration} in NIMBUS.`}
            questionnaireType={"During"}
            nIteration={nIteration}
            handleSuccess={(isSuccess) => {
              SetShowQAfterIterate(!isSuccess);
              SetShowQAfterNew(isSuccess);
              if (isSuccess) {
                iterate("classification");
              }
            }}
            show={showQAfterIterate}
            questionnaireTitle={`Questions after poviding classifications in iteration ${nIteration}`}
          />
        )}
        {showQAfterNew && (
          <QuestionsModal
            apiUrl={apiUrl}
            tokens={tokens}
            description={`After new solutions have been computed and shown to the decision maker in iteration ${nIteration} in NIMBUS.`}
            questionnaireType={"NewSolutions"}
            nIteration={nIteration}
            handleSuccess={(isSuccess) => {
              SetShowQAfterNew(!isSuccess);
            }}
            show={showQAfterNew}
            questionnaireTitle={`Questions after viewing new solutions.`}
          />
        )}
      </>
      {(currentState === "archive" || currentState === "select preferred") && (
        <>
          <Row>
            <Col sm={1}></Col>
            <Col sm={3}>
              <Button
                onClick={() => iterate("archive")}
                disabled={
                  solutionsArchivedAfterClassification ||
                  selectedIndices.length === 0
                }
              >
                {solutionsArchivedAfterClassification
                  ? "Solutions archived!"
                  : "Save selected solutions to archive"}
              </Button>
            </Col>
            <Col sm={4}>
              <Button
                onClick={() => iterate("classify preferred")}
                disabled={
                  (selectedIndexArchive !== -1 && selectedIndices.length > 0) ||
                  (selectedIndexArchive === -1 &&
                    selectedIndices.length === 0) ||
                  selectedIndices.length > 1
                }
              >
                {"Classify currently selected solution"}
              </Button>
            </Col>
            <Col sm={3}>
              <Button
                onClick={() => iterate("stop with preferred")}
                disabled={
                  (selectedIndexArchive !== -1 && selectedIndices.length > 0) ||
                  (selectedIndexArchive === -1 &&
                    selectedIndices.length === 0) ||
                  selectedIndices.length > 1
                }
              >
                {"Stop with currently selected solution"}
              </Button>
            </Col>
            <Col sm={1}></Col>
          </Row>
          <Row>
            <Col sm={12}>
              <h4 className={"mt-3"}>{"New solutions"}</h4>
            </Col>
            <Col sm={6}>
              <SolutionTableMultiSelect
                objectiveData={newSolutions!}
                activeIndices={selectedIndices}
                setIndices={SetSelectedIndices}
                tableTitle={""}
              />
            </Col>
            <Col sm={6}>
              <div className={"mt-1"}>
                <ParallelAxes
                  objectiveData={ToTrueValues(newSolutions!)}
                  selectedIndices={selectedIndices}
                  handleSelection={SetSelectedIndices}
                  dimensionsMaybe={{
                    chartHeight: 600,
                    chartWidth: 850,
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: 30,
                    marginBottom: 0,
                  }}
                />
              </div>
            </Col>
          </Row>
          {nSolutionsInArchive > 0 && (
            <Row>
              <Col sm={12}>
                <h4 className={"mt-3"}>{"Archived solutions"}</h4>
              </Col>
              <Col sm={6}>
                <SolutionTableNimbus
                  objectiveData={archivedSolutions!}
                  selectedIndex={selectedIndexArchive}
                  setIndex={(x: number) => {
                    SetSelectedIndexArchive(x);
                  }}
                  tableTitle={""}
                />
              </Col>
              <Col sm={6}>
                <div className={"mt-1"}>
                  <ParallelAxes
                    objectiveData={ToTrueValues(archivedSolutions!)}
                    selectedIndices={[selectedIndexArchive]}
                    handleSelection={(x: number[]) => {
                      if (x.length === 1) {
                        SetSelectedIndexArchive(-1);
                      } else {
                        SetSelectedIndexArchive(x.pop()!);
                      }
                    }}
                    dimensionsMaybe={{
                      chartHeight: 600,
                      chartWidth: 850,
                      marginLeft: 0,
                      marginRight: 0,
                      marginTop: 30,
                      marginBottom: 0,
                    }}
                  />
                </div>
              </Col>
            </Row>
          )}
        </>
      )}
      {currentState === "stop" && (
        <>
          <SolutionTable
            objectiveData={ParseSolutions([preferredPoint], activeProblemInfo)}
            setIndex={() => console.log("nothing happens...")}
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
          {!afterQEndMethodSuccess && (
            <Button onClick={() => SetShowQEndMethod(!showQEndMethod)}>
              Answer questionnaire
            </Button>
          )}
          {afterQEndMethodSuccess && (
            <Link to={"/finish"}>
              <Button>{"Finish"}</Button>
            </Link>
          )}
          <QuestionsModal
            apiUrl={apiUrl}
            tokens={tokens}
            description={"Questions asked at the end of the iterating NIMBUS."}
            questionnaireType={"After"}
            nIteration={nIteration}
            handleSuccess={(isSuccess) => {
              SetShowQEndMethod(!isSuccess);
              SetAfterQEndMethodSuccess(isSuccess);
            }}
            show={showQEndMethod}
            questionnaireTitle={"After NIMBUS questions"}
          />
        </>
      )}
    </Container>
  );
}

export default NimbusMethod;
