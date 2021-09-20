import { useEffect, useState, useCallback, useRef } from "react";
import {
  ProblemInfo,
  ObjectiveData,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
//import ReferencePointInputForm from "../components/ReferencePointInputForm";
import { Table, Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import {
  NavigationBars,
  ParallelAxes,
} from "visual-components";
import SolutionTable from "../components/SolutionTable";
import { Link } from "react-router-dom";

import Slider from '@material-ui/core/Slider';

import InputForm from "../components/InputForm";
import InputButton from "../components/InputButton";

import { useForm } from "react-hook-form";

// TODO: should be imported
type ProblemData = {
  upperBounds: number[][];
  lowerBounds: number[][];
  referencePoints: number[][];
  boundaries: number[][];
  totalSteps: number;
  stepsTaken: number;
  distance?: number;
  reachableIdx?: number[];
  stepsRemaining?: number;
  navigationPoint?: number[];
};

type RectDimensions = {
  chartWidth: number;
  chartHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
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

  // for sure used and needed
  const [helpMessage, SetHelpMessage] = useState<string>(
    "Method not started yet."
  );

  // holds active problem info, server form
  const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
  // boolean to contain method state
  const [methodStarted, SetMethodStarted] = useState<boolean>(false);
  // Data in user form to be sent to NavigationBars. 
  const [convertedData, SetConvertData] = useState<ProblemData>();
  // All steps taken, all data in server form. To be used when taking steps back etc.
  const [dataArchive, SetDataArchive] = useState<Array<ProblemData>>([]);
  // right now acts as the refe point to sent to the InputForm. Could/should be used better 
  const [referencePoint, SetReferencePoint] = useState<number[]>([]);
  const [boundaryPoint, SetBoundaryPoint] = useState<number[]>([]);

  // These have point, could possibly do nicer but works and needed
  const [iterateNavi, SetIterateNavi] = useState<boolean>(false);
  const itestateRef = useRef<boolean>();
  itestateRef.current = iterateNavi;

  // track dataArch change during iterate
  const dRef = useRef<Array<ProblemData>>();
  dRef.current = dataArchive

  const [speed, SetSpeed] = useState<number>(1);
  const speedRef = useRef<number>();
  speedRef.current = speed

  const [currentStep, SetCurrentStep] = useState<number>(0);

  //const stepRef = useRef<number>();
  //stepRef.current = currentStep
  const [goPrevious, SetPrevious] = useState<boolean>(false);
  const prevRef = useRef<boolean>(false);
  prevRef.current = goPrevious


  // maybe needed, could help
  const [currentData, SetCurrentData] = useState<ProblemData>(); // not used rn 

  // yleiset
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);

  const [satisfied, SetSatisfied] = useState<boolean>(false);
  const [showFinal, SetShowFinal] = useState<boolean>(false);
  const [alternatives, SetAlternatives] = useState<ObjectiveData>();
  const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  const [finalVariables, SetFinalVariables] = useState<number[]>([]);

  // default dims
  const dims: RectDimensions = {
    chartHeight: 800,
    chartWidth: 1200,
    marginLeft: 80,
    marginRight: 0,
    marginTop: 30,
    marginBottom: 0,
  };


  // FUNCTIONS to handle stuff

  const trueProbData = (info: ProblemInfo) => {
    const newInfo: ProblemInfo = {
      ideal: info.ideal.map((v, i) => (info.minimize[i] === 1 ? v : -v)),
      nadir: info.nadir.map((v, i) => (info.minimize[i] === 1 ? v : -v)),
      nObjectives: info.nObjectives,
      objectiveNames: info.objectiveNames,
      problemId: info.problemId,
      problemName: info.problemName,
      problemType: info.problemType,
      variableNames: info.variableNames,
      minimize: info.minimize,
    }
    return newInfo;
  }

  // TODO: refactor make simpler 
  const convertData = (data: ProblemData, minimize: number[]) => {
    const newlowU: number[][] = data.upperBounds.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))
    const newlowB: number[][] = data.lowerBounds.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))
    const newReferencePoints: number[][] = data.referencePoints.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))
    const newBounds: number[][] = data.boundaries.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))

    const newData: ProblemData = {
      upperBounds: newlowU,
      lowerBounds: newlowB,
      referencePoints: newReferencePoints,
      boundaries: newBounds,
      totalSteps: data.totalSteps,
      stepsTaken: data.stepsTaken,
    }
    return newData;
  }

  // ok basic idea works. TODO: better
  const updateRefPoint = (point: number[], refPoint: boolean) => {
    if (refPoint === true) {
      const newRefPoint = convertedData!.referencePoints.map((d, i) => d[currentStep - 1] = point[i])
      SetReferencePoint(newRefPoint)
      dataArchive[currentStep - 1].referencePoints.map((d, i) => d[currentStep] = -point[i])
    }
    else {
      const newBound = convertedData!.boundaries.map((d, i) => d[currentStep - 1] = point[i])
      SetBoundaryPoint(newBound)
      dataArchive[currentStep - 1].boundaries.map((d, i) => d[currentStep] = -point[i])
    }
    // need to create new object
    const newData: ProblemData = {
      upperBounds: convertedData!.upperBounds,
      lowerBounds: convertedData!.lowerBounds,
      referencePoints: convertedData!.referencePoints,
      boundaries: convertedData!.boundaries,
      totalSteps: convertedData!.totalSteps,
      stepsTaken: convertedData!.stepsTaken,
    }
    SetConvertData(newData)
  }

  // temp delay function to make the iter speed animation
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const toggleIteration = () => {
    SetLoading((loading) => !loading);
    SetIterateNavi((iterateNavi) => !iterateNavi);
  };


  //Kun osaan tehdä ...***### buttonin ja inputin jolla sitä vaihtaaa
  const goBack = (step: number) => {

    // temp steppi, tulisi tulla käyttäjältä 
    //let step = 3
    SetCurrentStep(step)

    // luodaan uusi dataArch johon kopioidaan vanha steppiin asti
    dataArchive.splice(step, dataArchive.length - 1)
    console.log(dataArchive)
    const newConData = convertData(dataArchive[step - 1], activeProblemInfo!.minimize)
    console.log(newConData)
    SetConvertData(newConData)
    SetPrevious(true);
  }

  const updatePrev = () => {
    SetPrevious(false)
  }

  // COMPONENT ACTIVITIES


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
          const ogdata: ProblemData = {
            upperBounds: body.minimize.map((_: number, i: number) => {
              return [body.ideal[i]]
            }),
            lowerBounds: body.minimize.map((_: number, i: number) => {
              return [body.nadir[i]]
            }),
            referencePoints: body.minimize.map((_: any, i: number) => {
              return [(body.nadir[i] + body.ideal[i]) / 2];
            }),
            boundaries: body.minimize.map((_: any, i: number) => {
              return [body.nadir[i]];
            }),
            totalSteps: 100,
            stepsTaken: 0,
          };
          //SetDataArchive([ogdata]); // no idea why this doenst work and i need to do the under onee. 
          dataArchive[0] = ogdata
          //const convertedData = convertData(ogdata, body.minimize)
          //SetConvertData(convertedData);
          SetCurrentStep(0);
          //SetDataArchive(ogdata);
          //SetReferencePoint(convertedData.referencePoints); to 1d
        } else {
          //some other code
          console.log(`could not fetch problem, got status code ${res.status}`);
        }
      } catch (e) {
        console.log("not ok, in fetchProblemInfo");
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

          // NOTE: server sends in different logic than we use here. upperBound is thought as the visual upperbound.
          const newArchiveData = {
            upperBounds: body.response.reachable_lb.map((d: number, i: number) => {
              return [d];
            }),
            lowerBounds: body.response.reachable_ub.map((d: number, i: number) => {
              return [d];
            }),
            referencePoints: dataArchive[0].referencePoints.map((d, i) => {
              return dataArchive[0].referencePoints[i].concat(d);
            }),
            boundaries: dataArchive[0].boundaries.map((d, i) => {
              return dataArchive[0].boundaries[i].concat(d);
            }), // convert to these from the coming nulls.
            totalSteps: 100, // this has to be 100, since step 1 is the first step according to the server.
            stepsTaken: 1,
            distance: body.response.distance, // check for possible float errors
            reachableIdx: body.response.reachable_idx,
            stepsRemaining: body.response.steps_remaining,
            navigationPoint: body.response.navigation_point,
          };

          dataArchive[0] = newArchiveData
          const convertedData = convertData(newArchiveData, activeProblemInfo!.minimize)
          SetConvertData(convertedData);
          SetCurrentStep(1);
          console.log(currentStep)
          SetMethodStarted(true);
          // dumb but works
          const len = convertedData!.referencePoints[0].length
          const curr = convertedData!.referencePoints.flatMap((d, _) => [d[len - 1]])
          SetReferencePoint(curr)

          const len2 = convertedData!.boundaries[0].length
          const bound = convertedData!.boundaries.flatMap((d, _) => [d[len2 - 1]])
          SetBoundaryPoint(bound)
          console.log("currPoint", referencePoint)

          SetFetchedInfo(true);
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


  useEffect(() => {
    if (itestateRef.current === false) {
      console.log("lopeta iter");
      return;
    }
    if (itestateRef.current === true) {
      console.log("iteroidaan")
    }
    const iterate = async () => {
      // Attempt to iterate
      // SetLoading(true);
      console.log("loading...");
      console.log(currentStep);
      // kääännä
      const refe = referencePoint.map((d, i) => activeProblemInfo?.minimize[i] === 1 ? d : -d)
      const bounds = boundaryPoint.map((d, i) => activeProblemInfo?.minimize[i] === 1 ? d : -d)
      console.log(refe)
      console.log(bounds)


      // sama juttu currentStep menee iteraten ulkopuolella oikein. useRef maybE? 
      while (itestateRef.current === true) {
        let resp;
        if (prevRef.current === false) {
          const respContinue = {
            reference_point: refe,
            speed: speedRef.current,
            go_to_previous: false,
            stop: !itestateRef.current,
            user_bounds: bounds,
          }

          resp = respContinue;
        }
        if (prevRef.current === true) {
          const respGoPrev = {
            ideal: activeProblemInfo!.ideal,
            nadir: activeProblemInfo!.nadir,
            reachable_ub: dataArchive[currentStep - 1].lowerBounds.flatMap((d, _) => [d[currentStep - 1]]),
            reachable_lb: dataArchive[currentStep - 1].upperBounds.flatMap((d, _) => [d[currentStep - 1]]),
            reference_point: refe,
            speed: speedRef.current,
            go_to_previous: true,
            stop: !itestateRef.current,
            user_bounds: bounds,
            step_number: dataArchive[currentStep - 1].stepsTaken,
            reachable_idx: dataArchive[currentStep - 1].reachableIdx, // to dataArc
            steps_remaining: dataArchive[currentStep - 1].stepsRemaining,
            distance: dataArchive[currentStep - 1].distance,
            allowed_speeds: [1, 2, 3, 4, 5],
            current_speed: speedRef.current,
            navigation_point: dataArchive[currentStep - 1].navigationPoint, // to dataArc 
          }
          resp = respGoPrev;
        }

        try {
          console.log(`Trying to iterate with ${refe}`);
          const res = await fetch(`${apiUrl}/method/control`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // oikeanmuotoisena navin tiedot
              response:
                resp,

            }),
          });
          console.log(res)
          updatePrev()
          //SetPrevious(false); // should be true only once maximum

          if (res.status === 200) {
            // ok
            const body = await res.json();
            const response = body.response;
            // muutokset
            SetHelpMessage(response.message);
            //console.log("resp", response);
            let dataArchive = dRef.current;

            // hacky trick to prevent setting the same data twice if backtracking
            if (body.response.steps_number === dataArchive![dataArchive!.length - 1].stepsTaken) {
              dataArchive!.pop()
              //SetDataArchive(dataArchive!);
            }


            const newArchiveData: ProblemData = {
              upperBounds: body.response.reachable_lb.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].upperBounds[i].concat(d);
              }),
              lowerBounds: body.response.reachable_ub.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].lowerBounds[i].concat(d);
              }),
              referencePoints: refe.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].referencePoints[i].concat(d);
              }),
              boundaries: body.response.user_bounds.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].boundaries[i].concat(d);
              }),
              totalSteps: 100,
              stepsTaken: body.response.step_number,
              distance: body.response.distance, // check for possible float errors
              reachableIdx: body.response.reachable_idx,
              stepsRemaining: body.response.steps_remaining,
              navigationPoint: body.response.navigation_point,
            };

            // hacky trick to prevent setting the same data twice if backtracking
            if (newArchiveData.stepsTaken === dataArchive![dataArchive!.length - 1].stepsTaken) {
              dataArchive!.pop()
              //SetDataArchive(dataArchive!);
            }

            SetDataArchive(dataArchive => [...dataArchive, newArchiveData])

            const convertedData = convertData(newArchiveData, activeProblemInfo!.minimize)
            SetConvertData(convertedData);
            SetCurrentStep(convertedData.stepsTaken)
            console.log(currentStep)
            //console.log(stepRef.current)

            if (newArchiveData.distance === 100) {
              console.log("Method finished with 100 steps")
              SetIterateNavi(false);
              SetLoading(false);
              SetFinalObjectives(response.navigation_point.map((v: number) => [-v]))
              // TODO: here get solutions, like in referenceMethod
              //SetFinalObjectives()
              //SetFinalVariables()
              SetShowFinal(true);
              return;
            }

            // hacky way to make speed matter
            await delay(5000 / speedRef.current!)


            //SetIterateNavi(itestateRef.current);
          } else {
            console.log("Got a response which is not 200");
          }
        } catch (e) {
          console.log("Could not iterate nau navi");
          console.log(e);
          // do nothing
        }
      }

      //itestateRef.current = false
      SetIterateNavi(false);
      SetLoading(false);
    };

    iterate()
  }, [iterateNavi, SetIterateNavi, itestateRef.current]);



  return (
    <Container>
      <h3 className="mb-2">{"NAUTILUS Navigator method"}</h3>
      {!satisfied && (
        <>
          <p className="mb-0">{`Help: ${helpMessage}`}</p>
          <Row>
            <Col md={2} className="mt-5">
              {fetchedInfo && (
                <>
                  <InputForm
                    setReferencePoint={(ref: number[]) => { updateRefPoint(ref, true) }}
                    referencePoint={referencePoint}
                    nObjectives={activeProblemInfo!.nObjectives}
                    objectiveNames={activeProblemInfo!.objectiveNames}
                    ideal={activeProblemInfo!.ideal}
                    nadir={activeProblemInfo!.nadir}
                    directions={activeProblemInfo!.minimize}
                    name={"Reference"}
                  />
                  <InputForm
                    setReferencePoint={(bound: number[]) => { updateRefPoint(bound, false) }}
                    referencePoint={boundaryPoint}
                    nObjectives={activeProblemInfo!.nObjectives}
                    objectiveNames={activeProblemInfo!.objectiveNames}
                    ideal={activeProblemInfo!.ideal}
                    nadir={activeProblemInfo!.nadir}
                    directions={activeProblemInfo!.minimize}
                    name={"Boundary"}
                  />
                </>
              )}
            </Col>
            <Col xxl={10} className="mr-auto">
              {fetchedInfo && (
                <div className={"mt-5"}>
                  {console.log("ennen piirtoa problemInfo", activeProblemInfo)}
                  {console.log("ennen piirtoa archive", dataArchive)}
                  {console.log("ennen piirtoa data", currentData)}
                  {console.log("ennen piirtoa conv data", convertedData)}
                  {console.log("ennen piirtoa steps", currentStep)}
                  {console.log("ennen piirtoa problem", trueProbData(activeProblemInfo!))}
                  <NavigationBars
                    problemInfo={trueProbData(activeProblemInfo!)} // TODO: these correct, its pain
                    problemData={convertedData!} // this to have data from back end
                    referencePoints={convertedData!.referencePoints} // these to use back end data
                    boundaries={convertedData!.boundaries}
                    handleReferencePoint={(ref: number[][]) => {
                      // kun steps, niin sitten steps -1 tms
                      let len = convertedData!.referencePoints[0].length
                      let refe = ref.map((d) => d[len - 1])
                      updateRefPoint(refe, true)
                    }}
                    handleBound={(bound: number[][]) => {
                      let len = convertedData!.boundaries[0].length
                      let boundy = bound.map((d) => d[len - 1])
                      updateRefPoint(boundy, false)
                    }}
                    dimensionsMaybe={dims}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col sm={2} className="mt-auto">
              <Slider
                value={speed}
                onChange={
                  (_, val) => {
                    SetSpeed(val as number)
                  }}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="off"
                step={1}
                marks={
                  [
                    {
                      value: 1,
                      label: '1',
                    },
                    {
                      value: 2,
                      label: '2',
                    },
                    {
                      value: 3,
                      label: '3',
                    },
                    {
                      value: 4,
                      label: '4',
                    },
                    {
                      value: 5,
                      label: '5',
                    },
                  ]

                }
                min={1}
                max={5}
              />
            </Col>
            <Col sm={2}>
              {loading && (
                <Button size={"lg"} onClick={toggleIteration}>
                  Stop
                </Button>
              )}
            </Col>
            <Col sm={2}>
              {!loading && !iterateNavi && (

                <Button size={"lg"} onClick={toggleIteration}>
                  Start Navigation
                </Button>
              )}
              {loading && (
                <Button
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
            <Col sm={1}>
              <InputButton
                stepNumber={currentStep}
                handleChange={(step: number) => { goBack(step) }}
              />
            </Col>
            <Col>
              {showFinal && (
                <p> Final Objective Values {finalObjectives} </p>
              )}
            </Col>
          </Row>
        </>
      )
      }
    </Container >
  );
}

export default NautilusNavigatorMethod;
