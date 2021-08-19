import { useEffect, useState, useCallback } from "react";
import {
  ProblemInfo,
  ObjectiveData,
  ObjectiveDatum,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import ReferencePointInputForm from "../components/ReferencePointInputForm";
import { Table, Container, Row, Col, Button, Form } from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import {
  HorizontalBars,
  NavigationBars,
  ParallelAxes,
} from "visual-components";
import SolutionTable from "../components/SolutionTable";
import { Link } from "react-router-dom";

// välidata
// Piirtää siis oikein kunhanh data on oikein hyvä juttu

type ProblemData = {
  upperBounds: number[][];
  lowerBounds: number[][];
  referencePoints: number[][];
  boundaries: number[][];
  totalSteps: number;
  stepsTaken: number;
};

const susProbInfo: ProblemInfo = {
  problemId: 1,
  problemName: "Sustainability problem",
  problemType: "Discrete",
  objectiveNames: [
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "x8",
    "x9",
    "x10",
    "x11",
  ],
  variableNames: ["social", "economic", "commercial"],
  nObjectives: 3,
  ideal: [-2.3208, -2.593, -3.9995],
  nadir: [-2.316, -1.7273, -1.7377],
  minimize: [-1, -1, -1],
};

const emptyData: ProblemData = {
  upperBounds: [
    [-2.32, -2.319], // objective 1
    [-2.5, -2.4], // objective 2
    [-3.8, -3.7], // objective 3
  ],
  lowerBounds: [
    [-2.316, -2.317], // objective 1
    [-1.8, -1.9], // objective 2
    [-1.8, -1.85], // objective 3
  ],
  referencePoints: [
    [-2.318, -2.318, -2.318], // objective 1
    [-1.9, -2, -2], // objective 2
    [-2.6, -2.7, -2.89], // objective 3
  ],
  // boundary needs to have set default value or some value for the objective if its not used so the order doenst go wrong
  boundaries: [
    [Number.NaN],
    [Number.NaN],
    //[0.7, 0.7,0.7,0.7,0.7,0.7,1, 1, 1, 1],
    [Number.NaN],
  ],
  totalSteps: 100,
  stepsTaken: 2, // this must to be stepsTaken - 1 from to the bounds and refereslines given.
};

interface NautilusNavigatorMethodProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
  methodCreated: boolean;
  activeProblemId: number | null;
  // muuta?
}

function NautilusNavigatorMethod({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
  methodCreated,
  activeProblemId,
}: NautilusNavigatorMethodProps) {
  const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
  const [methodStarted, SetMethodStarted] = useState<boolean>(false);
  const [data, SetData] = useState<ProblemData>();
  const [helpMessage, SetHelpMessage] = useState<string>(
    "Method not started yet."
  );

  // navigaattorille
  const [endNavigating, SetEndNavigating] = useState<boolean>(false); // navigaatio stepit täynnä ja loppu.
  const [stoppedNav, setStoppedNav] = useState<boolean>(true);

  // tämänlaisete mutta refviivoille / boundareille
  const [referencePoint, SetReferencePoint] = useState<number[]>([]);
  const [boundaryPoint, SetBoundaryPoint] = useState<number[]>([]);

  const [currentPoint, SetCurrentPoint] = useState<number[]>([]);

  // yleiset
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);

  // ei ehkä navigaattorille, mutta vastaavat voi olla hyvä
  const [satisfied, SetSatisfied] = useState<boolean>(false);
  const [showFinal, SetShowFinal] = useState<boolean>(false);
  const [alternatives, SetAlternatives] = useState<ObjectiveData>();
  const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  const [finalVariables, SetFinalVariables] = useState<number[]>([]);

  // ei olleenkaan / en ole varma
  const [indexCurrentPoint, SetIndexCurrentPoint] = useState<number>(0);

  // use effectejä vaan
  useEffect(() => {
    if (alternatives !== undefined) {
      SetCurrentPoint(alternatives.values[indexCurrentPoint].value);
    }
  }, [indexCurrentPoint]);



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

    // tarvittava
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
          console.log(body);
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
          console.log("AcT prob", activeProblemInfo)
          // lisätään navigaattorille oma info täällä
          //SetReferencePoint(body.ideal);
          //SetCurrentPoint(body.ideal);
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
          console.log("method data", body);
          console.log("Act prob infoi", activeProblemInfo);
          // To begin, just show something neutral
          // näytä alkunäkymä missä step 0

          const data: ProblemData = {
            upperBounds: body.response.reachable_ub,
            lowerBounds: body.response.reachable_lb,
            referencePoints: body.response.navigation_point,
            boundaries: [[Number.NaN], [Number.NaN], [Number.NaN]], // convert to these from the coming nulls.
            totalSteps: body.response.steps_remaining,
            stepsTaken: body.response.step_number,
          };

          console.log("Tämä muoto", data);

          SetData(data);
          SetMethodStarted(true);
          //SetReferencePoint(datum.value);
          SetHelpMessage(
            `Provide a reference point. The current reference point is `
          );
        }
      } catch (e) {
        console.log("not ok, could not start the method");
      }
    };

    startMethod();
  }, [activeProblemInfo, methodStarted]);

  // start nav button click niin, iteroidaan määrätyllä vauhdilla
  const iterate = async () => {
    // Attempt to iterate
    SetLoading(true);
    console.log("loading...");
    if (!stoppedNav) {
      try {
        console.log(`Trying to iterate with ${referencePoint}`);
        const res = await fetch(`${apiUrl}/method/control`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // oikeanmuotoisena navin tiedot
            response: { reference_point: data!.referencePoints },
          }),
        });

        if (res.status === 200) {
          // ok
          const body = await res.json();
          const response = body.response;
          // muutokset
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
        console.log("Could not iterate nau navi");
        console.log(e);
        // do nothing
      }
    } else {
      try {
        const res = await fetch(`${apiUrl}/method/control`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: { satisfied: true, solution_index: indexCurrentPoint },
          }),
        });

        if (res.status === 200) {
          // ok
          const body = await res.json();
          const response = body.response;
          SetFinalObjectives(response.objective_vector);
          SetFinalVariables(response.solution);
          SetShowFinal(true);
        } else {
          console.log("Got a response which is not 200");
        }
      } catch (e) {
        console.log("Could not iterate RFP");
        console.log(e);
        // do nothing
      }
    }
    SetLoading(false);
    console.log("done!");
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
      <h3 className="mb-3">{"Nautilus navigator method"}</h3>
      {!showFinal && (
        <>
          <p>{`Help: ${helpMessage}`}</p>
          <Row>
            <Col sm={4}></Col>
            <Col sm={4}>
              {!loading && stoppedNav && (
                <Button block={true} size={"lg"} onClick={iterate}>
                  Start Navigation
                </Button>
              )}
              {!loading && !stoppedNav && (
                <Button block={true} size={"lg"} onClick={iterate}>
                  Stop
                </Button>
              )}
              {loading && (
                <Button
                  block={true}
                  disabled={true}
                  size={"lg"}
                  variant={"info"}
                >
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
          </Row>
          <Row></Row>
          <Row>
            <Col sm={8}>
              {fetchedInfo && (
                <div className={"mt-5"}>
                  <NavigationBars
                    problemInfotest={activeProblemInfo} // TODO: these correct, its pain
                    problemData={emptyData}
                    handleReferencePoint={SetReferencePoint}
                    handleBound={SetBoundaryPoint}
                  />
                </div>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default NautilusNavigatorMethod;
