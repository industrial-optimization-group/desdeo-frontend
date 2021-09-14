import { useEffect, useState, useCallback, useRef } from "react";
import {
  ProblemInfo,
  ObjectiveData,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
//import ReferencePointInputForm from "../components/ReferencePointInputForm";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
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

/* TODO:
 * varmaan parempi olisi jos menisi navbarseille
 * referencePoints ja boundary omassa propsissa.
 * ei tarvitse piirtää koko dataa uudestaan kun niitä
 * liiikuttaa sitten
 *
 * polygoneille step 0:
 * idealista ja nadirista kun valmistaa..
 *
 */

/*

mahtasko toimia jos pitäisi täällä datassa aina saman kun servulla ja vain kun lähettää komponentille niin kääntää? vai pitäisikö vain
komponentin kääntää ne ?
*/

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
    //minimize: info.minimize.map((_, i) => (info.minimize[i] === 1 ? v : -v)), // ei pitäisi tätä kyllä tehdä
    minimize: info.minimize,
  }
  return newInfo;
}

// get rid of this
const marks = [
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

const convertData = (data: ProblemData, minimize: number[]) => {

  const newlowB: number[][] = data.lowerBounds.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))
  const newlowU: number[][] = data.upperBounds.map((d, i) => d.map((v) => minimize[i] === 1 ? v : -v))
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

// TODO: nyt on jo kova aika tehä viksummin kaikki

// this causes "random" bug
// temporary way of handling references
const getRefPoint = (refs: number[][]) => {
  let refe: number[] = [];
  refs.forEach((ref) => refe.push(ref[ref.length - 1] * -1));
  console.log("gotten refe", refe);
  return refe;
};

// dummy for now. Need to convert NaN's to nulls
const getBounds = (bounds: number[][]) => {
  return [null, null, null];
};

// temp delay function to make the iter speed animation
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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


  // currently holds the latest referencePoint for iterate in server/navibar form and then gets converted by custom func 
  // to be sent to server or the opposite
  const [referencePoint, SetReferencePoint] = useState<number[]>(
  );
  const [boundaryPoint, SetBoundaryPoint] = useState<number[][]>(
  );

  // These have point, could possibly do nicer but works and needed
  const [endNavigating, SetEndNavigating] = useState<boolean>(false); // navigaatio stepit täynnä ja loppu.
  const [iterateNavi, SetIterateNavi] = useState<boolean>(false);
  const itestateRef = useRef<boolean>();
  itestateRef.current = iterateNavi;

  // track dataArch change during iterate
  const dRef = useRef<Array<ProblemData>>();
  dRef.current = dataArchive

  const [speed, SetSpeed] = useState<number>(1);
  const speedRef = useRef<number>();
  speedRef.current = speed

  // maybe needed, could help
  const [currentData, SetCurrentData] = useState<ProblemData>(); // not used rn 
  const [currentStep, SetCurrentStep] = useState<number>(0);



  // right now acts as the refe point to sent to the InputForm. Could/should be used better 
  const [currentPoint, SetCurrentPoint] = useState<number[]>([]);

  // yleiset
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);

  // ei ehkä navigaattorille, mutta vastaavat voi olla hyvä
  //const [satisfied, SetSatisfied] = useState<boolean>(false);
  const [showFinal, SetShowFinal] = useState<boolean>(false);
  //const [alternatives, SetAlternatives] = useState<ObjectiveData>();
  //const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  //const [finalVariables, SetFinalVariables] = useState<number[]>([]);



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
          // set data start from ideal and nadir
          // INITIALIZE step 0.
          const ogdata: ProblemData = {
            upperBounds: body.nadir.map((d: number) => {
              return [d];
            }),
            lowerBounds: body.ideal.map((d: number) => {
              return [d];
            }),
            referencePoints: body.minimize.map((_: any, i: number) => {
              return [(body.nadir[i] + body.ideal[i]) / 2];
            }),
            boundaries: [[Number.NaN], [Number.NaN], [Number.NaN]], // convert to these from the coming nulls.
            totalSteps: 100,
            stepsTaken: 0,
          };
          SetDataArchive([ogdata]); // no idea why this doenst work and i need to do the under onee. 
          dataArchive[0] = ogdata
          const convertedData = convertData(ogdata, body.minimize)
          SetConvertData(convertedData);
          console.log("Data fetchissä", dataArchive)
          //SetCurrentStep(0);
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

          // TODO: unite them, make new object which set to the currentdata and add to the archive at correct position.
          // stupid but kinda the right idea. Now just need to add the currentData values to the dataArchive..
          const newArchiveData = {
            upperBounds: body.response.reachable_ub.map((d: number, i: number) => {
              return dataArchive[0].upperBounds[i].concat(d);
            }),
            lowerBounds: body.response.reachable_lb.map((d: number, i: number) => {
              return dataArchive[0].lowerBounds[i].concat(d);
            }),
            // TODO: fix this too
            referencePoints: dataArchive[0].referencePoints.map((d, i) => {
              return dataArchive[0].referencePoints[i].concat(d);
            }),
            boundaries: [[Number.NaN], [Number.NaN], [Number.NaN]], // convert to these from the coming nulls.
            totalSteps: 100,
            stepsTaken: body.response.step_number,
          };

          SetDataArchive(dataArchive => [...dataArchive, newArchiveData])

          //console.log(newArchiveDataAll)
          // @ts-ignore
          //SoetDataArchive(dataArchive => ({
          //  upperBounds: [...dataArchive.upperBounds, newArchiveDataAll.upperBounds]
          //}))

          //SetCurrentData(dataArchive[0]);
          const convertedData = convertData(dataArchive[0], activeProblemInfo!.minimize)
          SetConvertData(convertedData);


          // SetCurrentStep(1);
          SetMethodStarted(true);
          // SetReferencePoint(convertedData!.referencePoints); //TODO: mites tupla taulukon kanssa, miten toimii nav comp nyt.
          // dumb but works
          const len = convertedData!.referencePoints[0].length
          const curr = convertedData!.referencePoints.flatMap((d, _) => [d[len - 1]])
          SetCurrentPoint(curr)
          console.log("currPoint", currentPoint)


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

      console.log("REf point", referencePoint);
      console.log(currentStep);

      // kääännä
      const refe = currentPoint!.map((d, i) => activeProblemInfo?.minimize[i] === 1 ? d : -d)


      let bounds = getBounds(boundaryPoint!)

      // sama juttu currentStep menee iteraten ulkopuolella oikein. useRef maybE? 
      while (itestateRef.current === true) {
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
              response: {
                reference_point: refe, // TODO: täälä kutst
                speed: speedRef.current,
                go_to_previous: false,
                stop: false,
                user_bounds: bounds,
              },
            }),
          });

          if (res.status === 200) {
            // ok
            const body = await res.json();
            const response = body.response;
            // muutokset
            SetHelpMessage(response.message);
            //console.log("resp", response);
            let dataArchive = dRef.current;

            const newArchiveData: ProblemData = {
              upperBounds: body.response.reachable_ub.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].upperBounds[i].concat(d);
              }),
              lowerBounds: body.response.reachable_lb.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].lowerBounds[i].concat(d);
              }),
              referencePoints: refe.map((d: number, i: number) => {
                return dataArchive![dataArchive!.length - 1].referencePoints[i].concat(d);
              }),
              boundaries: body.response.user_bounds.map((d: any, i: any) => {
                return dataArchive![dataArchive!.length - 1].boundaries[i].concat(parseFloat(d));
              }),
              totalSteps: 100,
              stepsTaken: body.response.step_number,
            };

            // täällä lähtee aina yhä dataArchive ensimmäiseltä async iteraatio ajolta
            SetDataArchive(dataArchive => [...dataArchive, newArchiveData])



            //updateDataArchive(newArchiveData, 0)
            //console.log("Iteraatio", dataArchive);
            const convertedData = convertData(newArchiveData, activeProblemInfo!.minimize)
            SetConvertData(convertedData);

            //console.log("Data start iter", dataArchive)
            //SetCurrentStep(currentStep => newArchiveData.stepsTaken);
            //console.log("stepit menee", currentStep, newArchiveData.stepsTaken)
            //TODO:
            //SetReferencePoint(newArchiveData.referencePoints); // mites tupla taulukon kanssa, miten toimii nav comp nyt.
            //console.log(currentData!.stepsTaken)

            if (convertedData.stepsTaken === 100) {
              console.log("Method finished with 100 steps")
              SetIterateNavi(false);
              SetLoading(false);
              return;
            }

            // hacky way to make speed matter
            if (speedRef.current != 5) {
              await delay(2000 / speedRef.current!)
            }

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

  function toggleIteration() {
    SetLoading((loading) => !loading);
    SetIterateNavi((iterateNavi) => !iterateNavi);
  }

  // ok basic idea works. TODO: better
  const updateRefPoint = (ref: number[]) => {
    // the minus got to be done elsewhere tho.
    const newRefPoint = convertedData!.referencePoints.map((d, i) => d[convertedData!.referencePoints[0].length - 1] = ref[i])

    // this should be here but the minuses are wrong
    SetCurrentPoint(newRefPoint)
    // TODO: possibly fix the steps with conv data.
    dataArchive[convertedData!.stepsTaken].referencePoints.map((d, i) => d[convertedData!.stepsTaken] = -ref[i])

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
    console.log("uusi pisteen", newRefPoint)

  }

  return (
    <Container>
      <h3 className="mb-2">{"NAUTILUS Navigator method"}</h3>
      {!showFinal && (
        <>
          <p className="mb-0">{`Help: ${helpMessage}`}</p>
          <Row>
            <Col xxl={3} className="mt-5">
              {fetchedInfo && (
                <InputForm
                  setReferencePoint={(ref: number[]) => { updateRefPoint(ref) }}
                  setBoundaryPoint={() => [2, 2, 2]}
                  referencePoint={currentPoint}
                  boundary={[2, 2, 2]}
                  nObjectives={activeProblemInfo!.nObjectives}
                  objectiveNames={activeProblemInfo!.objectiveNames}
                  ideal={activeProblemInfo!.ideal}
                  nadir={activeProblemInfo!.nadir}
                  directions={activeProblemInfo!.minimize}
                />
              )}
            </Col>
            <Col xxl={9}>
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
                      updateRefPoint(refe)

                      // this to 1d too 
                      //SetReferencePoint(ref);
                      // TODO: to be done cleaner
                      //const len = convertedData!.referencePoints[0].length
                      //const curr = convertedData!.referencePoints.flatMap((d, _) => [d[len - 1]])
                      //SetCurrentPoint(curr)
                    }}
                    handleBound={(bound: number[][]) => {
                      SetBoundaryPoint(bound);
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <Slider
                value={speed}
                onChange={
                  (_, val) => {
                    SetSpeed(val as number)
                  }}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="on"
                step={1}
                marks={marks}
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
          </Row>
        </>
      )
      }
    </Container >
  );
}

export default NautilusNavigatorMethod;
