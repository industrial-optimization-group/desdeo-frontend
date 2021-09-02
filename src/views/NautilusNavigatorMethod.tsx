import { useEffect, useState, useCallback, useRef } from "react";
import {
  ProblemInfo,
  ObjectiveData,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
//import ReferencePointInputForm from "../components/ReferencePointInputForm";
import { Table, Container, Row, Col, Button, Form } from "react-bootstrap";
import ReactLoading from "react-loading";
import { ParseSolutions, ToTrueValues } from "../utils/DataHandling";
import {
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


// huhhu kun on 2d arrayt tehty vaikeeksi js
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
  console.log(newData)

  return newData;
}


// TODO: nyt on jo kova aika tehä viksummin kaikki

// temporary way of handling references
// fails now if not moved ref point b4 first iter. Bcc the *-1
const getRefPoint = (refs: number[][]) => {
  console.log(refs);

  let refe: number[] = [];
  refs.forEach((ref) => refe.push(ref[ref.length - 1] * -1));
  console.log("gotten refe", refe);

  return refe;
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
  // this has one data object the currently used
  const [currentData, SetCurrentData] = useState<ProblemData>();
  const [convertedData, SetConvertData] = useState<ProblemData>();

  const [dataArchive, SetDataArchive] = useState<Array<ProblemData>>([]);


  const [currentStep, SetCurrentStep] = useState<number>(0); // maybe this to set the currentstep to right one and then pick the correct from dataArchive ?


  const [helpMessage, SetHelpMessage] = useState<string>(
    "Method not started yet."
  );

  // navigaattorille
  const [endNavigating, SetEndNavigating] = useState<boolean>(false); // navigaatio stepit täynnä ja loppu.
  const [iterateNavi, SetIterateNavi] = useState<boolean>(false);
  const itestateRef = useRef<boolean>();
  itestateRef.current = iterateNavi;


  const dRef = useRef<Array<ProblemData>>();
  dRef.current = dataArchive


  // tämänlaisete mutta refviivoille / boundareille
  const [referencePoint, SetReferencePoint] = useState<number[][]>(
  );
  const [boundaryPoint, SetBoundaryPoint] = useState<number[][]>(
  );

  // this could be the new point, just moved. To be added to refpoints.
  const [currentPoint, SetCurrentPoint] = useState<number[]>([]);

  // yleiset
  const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
  const [loading, SetLoading] = useState<boolean>(false);

  // ei ehkä navigaattorille, mutta vastaavat voi olla hyvä
  //const [satisfied, SetSatisfied] = useState<boolean>(false);
  const [showFinal, SetShowFinal] = useState<boolean>(false);
  const [alternatives, SetAlternatives] = useState<ObjectiveData>();
  //const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);
  //const [finalVariables, SetFinalVariables] = useState<number[]>([]);

  // ei olleenkaan / en ole varma
  const [indexCurrentPoint, SetIndexCurrentPoint] = useState<number>(0);

  // is coming here really necessary so this starts properly what ?
  // TODO: we needing this to make this work is not good
  const updateDataArchive = (data: ProblemData, ind: number) => {
    console.log("DAtaa on nyt", dataArchive);
    dataArchive[ind] = data;
    console.log("DAtaa on nyt2", dataArchive);
  };

  // TODO: check this useEff
  useEffect(() => {
    console.log(referencePoint, " ReferencePoint -  has changed");
    if (referencePoint !== undefined) {
      SetReferencePoint(referencePoint);
      // jotenkin currentSTep + 1 jos liikutetaan
      SetCurrentPoint(referencePoint[currentStep]);
    }
  }, [referencePoint, currentStep]);

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
          // TODO: here 


          SetCurrentData(ogdata);

          //SetDataArchive(dataArchive => [...dataArchive, ogdata]); // should be ok ?
          updateDataArchive(ogdata, 0); // apparently we need to call something outside for the method to start properly ??
          SetDataArchive([ogdata])


          const convertedData = convertData(ogdata, body.minimize)
          SetConvertData(convertedData);

          console.log("Data fetchissä", dataArchive)

          SetCurrentStep(0);
          //SetDataArchive(ogdata);
          //SetReferencePoint(body.ideal);
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

          // tulisi ottaa kopio viimeisimmästä johon lisätä tämä uusi archiveData perään että tulee historioineen. ja sitten lisätä SetDataArchive een 
          //const newArchiveDataAll = dataArchive.map(() => (dataArchive[0] = newArchiveData))

          SetDataArchive(dataArchive => [...dataArchive, newArchiveData])

          //console.log(newArchiveDataAll)
          // @ts-ignore
          //SoetDataArchive(dataArchive => ({
          //  upperBounds: [...dataArchive.upperBounds, newArchiveDataAll.upperBounds]
          //}))

          //SetCurrentData(dataArchive[0]);
          //const convertedData = convertData(dataArchive[0], activeProblemInfo!.minimize)
          //SetConvertData(convertedData);


          SetCurrentStep(1);
          SetMethodStarted(true);
          SetReferencePoint(newArchiveData.referencePoints); // mites tupla taulukon kanssa, miten toimii nav comp nyt.


          console.log("Data start method", dataArchive)

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

      // joo askeleet kusee ja pahasti, pitäisi olla cstep 15 kun onkin 12..
      // tämä joo kusee että miten kutsutaan oikein.. jos stopaa iter, vaihtaa ref niin aloittaa vanhasta,mutta jos stoppaa ja vaihtaa uudestaan, niin sitten näkyy eka vaihto
      let refe = getRefPoint(referencePoint!); // täällä kutsutaan tätä refeä ja tietysti jos stopattu ollaan, niin ei lähetetä tätä minnekkään sen myötä

      // sama juttu currentStep menee iteraten ulkopuolella oikein. useRef maybE? 
      while (itestateRef.current === true && (currentStep < 100)) {
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
                speed: 5,
                go_to_previous: false,
                stop: false,
                user_bounds: [null, null, null],
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
              upperBounds: body.response.reachable_ub.map((d: any, i: any) => {
                // @ts-ignore
                return dataArchive[dataArchive.length - 1].upperBounds[i].concat(d);
              }),
              lowerBounds: body.response.reachable_lb.map((d: any, i: any) => {
                // @ts-ignore
                return dataArchive[dataArchive.length - 1].lowerBounds[i].concat(d);
              }),
              referencePoints: refe.map((d: any, i: any) => {
                // @ts-ignore
                return dataArchive[dataArchive.length - 1].referencePoints[i].concat(d);
              }),
              boundaries: [[Number.NaN], [Number.NaN], [Number.NaN]], // convert to these from the coming nulls.
              totalSteps: 100,
              stepsTaken: body.response.step_number,
            };

            // täällä lähtee aina yhä dataArchive ensimmäiseltä async iteraatio ajolta
            SetDataArchive(dataArchive => [...dataArchive, newArchiveData])



            //updateDataArchive(newArchiveData, 0)
            //console.log("Iteraatio", dataArchive);
            const convertedData = convertData(newArchiveData, activeProblemInfo!.minimize)
            SetConvertData(convertedData);

            console.log("Data start iter", dataArchive)
            SetCurrentStep(currentStep => newArchiveData.stepsTaken);
            console.log("stepit menee", currentStep, newArchiveData.stepsTaken)
            SetReferencePoint(newArchiveData.referencePoints); // mites tupla taulukon kanssa, miten toimii nav comp nyt.
            //console.log(currentData!.stepsTaken)

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
      //SetReferencePoint(currentData!.referencePoints); // mites tupla taulukon kanssa, miten toimii nav comp nyt.
      SetIterateNavi(false);
      SetLoading(false);
    };

    iterate()
  }, [iterateNavi, SetIterateNavi, itestateRef.current]);

  function klik() {
    SetLoading((loading) => !loading);
    SetIterateNavi((iterateNavi) => !iterateNavi);
  }

  return (
    <Container>
      <h3 className="mb-3">{"NAUTILUS Navigator method"}</h3>
      {!showFinal && (
        <>
          <p>{`Help: ${helpMessage}`}</p>
          <Row>
            <Col sm={4}>
              {loading && iterateNavi && (
                <Button block={true} size={"lg"} onClick={klik}>
                  Stop
                </Button>
              )}
            </Col>
            <Col sm={4}>
              {!loading && !iterateNavi && (
                <Button block={true} size={"lg"} onClick={klik}>
                  Start Navigation
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
                      SetReferencePoint(ref);
                      //SetCurrentStep((currentStep) => currentStep + 1);
                    }}
                    handleBound={(bound: number[][]) => {
                      SetBoundaryPoint(bound);
                    }}
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
