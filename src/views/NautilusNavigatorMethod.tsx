import { useEffect, useState, useRef } from "react";
import {
    ProblemInfo,
    ObjectiveData,
    NavigationData,
} from "../types/ProblemTypes";
import { Tokens } from "../types/AppTypes";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import ReactLoading from "react-loading";
import { NavigationBars } from "desdeo-components";
import Slider from "@material-ui/core/Slider";
import InputForm from "../components/InputForm";

// TODO: should be imported, and need to update the NavigationData type in NavigationBars /types
// Test with 7 maximizable objectives.. only possible to test the drawing I guess..
//
// this for navigationProblems
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
}

function NautilusNavigatorMethod({
    isLoggedIn,
    loggedAs,
    tokens,
    apiUrl,
    methodCreated,
    activeProblemId,
}: NautilusNavigatorMethodProps) {
    // holds active problem info, server form
    const [activeProblemInfo, SetActiveProblemInfo] = useState<ProblemInfo>();
    const [ready, SetReady] = useState<Boolean>(false);
    // boolean to contain method state
    const [methodStarted, SetMethodStarted] = useState<boolean>(false);
    // Data in user form to be sent to NavigationBars.
    const [convertedData, SetConvertData] = useState<NavigationData>();
    // All steps taken, all data in server form. To be used when taking steps back etc.
    const [dataArchive, SetDataArchive] = useState<Array<NavigationData>>([]);
    const [startArchive, SetStartArchive] = useState<NavigationData>();
    // right now acts as the refe point to sent to the InputForm. Could/should be used better
    const [referencePoint, SetReferencePoint] = useState<number[]>([]);
    const [boundaryPoint, SetBoundaryPoint] = useState<number[]>([]);

    // These have point, could possibly do nicer but works and needed
    const [iterateNavi, SetIterateNavi] = useState<boolean>(false);
    const itestateRef = useRef<boolean>();
    itestateRef.current = iterateNavi;

    // track dataArch change during iterate
    const dRef = useRef<Array<NavigationData>>();
    dRef.current = dataArchive;

    // handles speed.
    const speedo = 2000; // in ms. speedo / speed, is the current speed of iteration
    const [speed, SetSpeed] = useState<number>(1);
    const speedRef = useRef<number>();
    speedRef.current = speed;

    const [currentStep, SetCurrentStep] = useState<number>(1);

    const [goPrevious, SetPrevious] = useState<boolean>(false);
    const prevRef = useRef<boolean>(false);
    prevRef.current = goPrevious;

    // general 
    const [fetchedInfo, SetFetchedInfo] = useState<boolean>(false);
    const [loading, SetLoading] = useState<boolean>(false);

    const [satisfied, SetSatisfied] = useState<boolean>(false);
    const [showFinal, SetShowFinal] = useState<boolean>(false);
    //const [alternatives, SetAlternatives] = useState<ObjectiveData>();
    //const [finalObjectives, SetFinalObjectives] = useState<number[]>([]);


    // TODO: set decision variables here
    const [finalVariables, SetFinalVariables] = useState<number[]>([]);


    // default dims. Change height to fit objectives better, currently no adaptive chartdims.
    const dims: RectDimensions = {
        chartHeight: 1200,
        chartWidth: 1200,
        marginLeft: 80,
        marginRight: 10,
        marginTop: 40,
        marginBottom: 0,
    };

    // FUNCTIONS to handle stuff

    // NavigationBars needs ideal and nadir converted.
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
        };
        return newInfo;
    };

    // NavigationBars needs stuff converted. Logic, ideal is top, maximizing and upperBound is on top.
    const convertData = (data: NavigationData, minimize: number[]) => {
        return {
            upperBounds: data.upperBounds.map((d, i) =>
                d.map((v) => (minimize[i] === 1 ? v : -v))
            ),
            lowerBounds: data.lowerBounds.map((d, i) =>
                d.map((v) => (minimize[i] === 1 ? v : -v))
            ),
            referencePoints: data.referencePoints.map((d, i) =>
                d.map((v) => (minimize[i] === 1 ? v : -v))
            ),
            boundaries: data.boundaries.map((d, i) =>
                d.map((v) => (minimize[i] === 1 ? v : -v))
            ),
            totalSteps: data.totalSteps,
            stepsTaken: data.stepsTaken,
        };
    };

    // updates the ref/boundary points with the InputForm
    const updatePoint = (point: number[], refPoint: boolean) => {
        if (refPoint === true) {
            const newRefPoint = convertedData!.referencePoints.map(
                (d, i) => (d[currentStep] = point[i])
            );
            SetReferencePoint(newRefPoint);
            dataArchive![currentStep - 1].referencePoints.map(
                (d, i) => (d[currentStep] = -point[i])
            );
        } else {
            const newBound = convertedData!.boundaries.map(
                (d, i) => (d[currentStep] = point[i])
            );
            SetBoundaryPoint(newBound);
            dataArchive![currentStep - 1].boundaries.map(
                (d, i) => (d[currentStep] = -point[i])
            );
        }
        // need to create new object
        const newData: NavigationData = {
            upperBounds: convertedData!.upperBounds,
            lowerBounds: convertedData!.lowerBounds,
            referencePoints: convertedData!.referencePoints,
            boundaries: convertedData!.boundaries,
            totalSteps: convertedData!.totalSteps,
            stepsTaken: convertedData!.stepsTaken,
        };
        SetConvertData(newData);
    };

    // TODO: make tests
    const popLast = (dataArchive: any[]) => {
        dataArchive[dataArchive.length - 1].upperBounds.map((d: number[]) => {
            d.pop();
        });

        dataArchive[dataArchive.length - 1].lowerBounds.map((d: number[]) => {
            d.pop();
        });

        dataArchive[dataArchive.length - 1].referencePoints.map((d: number[]) => {
            d.pop();
        });

        dataArchive[dataArchive.length - 1].boundaries.map((d: number[]) => {
            d.pop();
        });
    }

    // temp delay function to make the iter speed animation
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const toggleIteration = () => {
        SetLoading((loading) => !loading);
        SetIterateNavi((iterateNavi) => !iterateNavi);
    };

    // TODO: basic idea works, to be done better.
    const goBack = (step: number) => {
        // need to stop iteration if going back
        if (itestateRef.current === true) {
            SetIterateNavi(false);
            //ite
        }
        if (step > currentStep) {
            console.log("cant go back to the future");
            return;
        }
        dataArchive!.splice(step, dataArchive!.length - 1);

        const newConData = convertData(
            dataArchive![step - 1],
            activeProblemInfo!.minimize
        );
        SetConvertData(newConData);
        // update referencePoints  
        const updatedRef = newConData!.referencePoints.flatMap((d: number[]) => [
            d[newConData!.referencePoints[0].length - 1],
        ])
        SetReferencePoint(
            updatedRef
        );
        const updatedBound = newConData!.boundaries.flatMap((d: number[]) => [
            d[newConData!.boundaries[0].length - 1],
        ]);
        SetBoundaryPoint(
            updatedBound
        );
        //SetDataArchive(dataArchive)
        SetCurrentStep(step);
        SetPrevious(true); // state to true so iterate works properly
        SetShowFinal(false);
    };

    const checkSolution = () => {
        // get decision variables from server
        SetFinalVariables([1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
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

                    if (activeProblemInfo === undefined) {
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
                    }
                    //SetMethodStarted(true);
                    SetReady(true);
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
        if (!ready) {
            return;
        }
        if (activeProblemInfo === null || activeProblemInfo === undefined) {
            // no active problem, do nothing
            console.log("Active problem not defined yet.");
            return;
        }
        if (methodStarted) {
            // method already started, do nothing
            console.log("method already started")
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

                    const ideal = activeProblemInfo.ideal;
                    const nadir = activeProblemInfo.nadir;
                    // NOTE: server sends in different logic than we use here. upperBound is thought as the visual upperbound.
                    const newArchiveData = {
                        upperBounds: body.response.reachable_lb.map((d: number) => {
                            return [d];
                        }),
                        lowerBounds: body.response.reachable_ub.map((d: number) => {
                            return [d];
                        }),
                        referencePoints: activeProblemInfo.minimize.map((_: any, i: number) => {
                            return [(nadir[i] + ideal[i]) / 2].concat((nadir[i] + ideal[i]) / 2);
                        }),
                        boundaries: activeProblemInfo.minimize.map((d, i) => {
                            return [nadir[i]].concat(nadir[i]);
                        }),
                        totalSteps: 100, // this has to be 100, since step 1 is the first step according to the server.
                        stepsTaken: body.response.step_number,
                        //stepsTaken: 0,
                        distance: body.response.distance, // check for possible float errors
                        reachableIdx: body.response.reachable_idx,
                        stepsRemaining: body.response.steps_remaining,
                        navigationPoint: body.response.navigation_point,
                    };

                    // put over the old one since we want the steps go along with the drawing, drawing needs more than one point to work
                    SetStartArchive(newArchiveData)
                    const convertedData = convertData(
                        newArchiveData,
                        activeProblemInfo!.minimize
                    );
                    SetConvertData(convertedData);
                    // TODO: this is needed right now, but it creates another archive later for iterations. So this should not be needed.
                    SetDataArchive([newArchiveData]);
                    // TODO: do we need thse
                    SetReferencePoint(
                        convertedData.referencePoints.flatMap((d: number[]) => [
                            d[convertedData.referencePoints[0].length - 1],
                        ])
                    );
                    SetBoundaryPoint(
                        convertedData.boundaries.flatMap((d: number[]) => [
                            d[convertedData.boundaries[0].length - 1],
                        ])
                    );

                    SetFetchedInfo(true);
                    SetMethodStarted(true);
                }
            } catch (e) {
                console.log("not ok, could not start the method");
            }
        };

        startMethod();
    }, [activeProblemInfo, methodStarted, ready]);

    useEffect(() => {
        if (itestateRef.current === false) {
            // console.log("lopeta iter");
            return;
        }

        if (dataArchive.length === 0) {
            SetDataArchive([startArchive!]);
        }

        const iterate = async () => {
            // Attempt to iterate
            SetLoading(true);
            console.log("loading...");
            console.log(currentStep);

            // turn these for the server
            //console.log("refe", referencePoint);
            // TODO: handle these better. Should never fire though.
            if (activeProblemInfo === undefined) {
                console.log("not ok, activeProblem not defined");
                return;
            }
            if (startArchive === undefined) {
                console.log("not ok, startArchive not defined")
                return;
            }
            const refe = referencePoint.map((d, i) =>
                activeProblemInfo.minimize[i] === 1 ? d : -d
            );
            const bounds = boundaryPoint.map((d, i) =>
                activeProblemInfo.minimize[i] === 1 ? d : -d
            );

            while (itestateRef.current === true) {

                //const dataArchive = dRef.current;
                if (dataArchive === undefined) {
                    return;
                }
                if (dataArchive.length === 0) {
                    return;
                }
                let resp: any; // since 2 responses depending are we backtracking or not
                if (prevRef.current === false) {
                    const respContinue = {
                        reference_point: refe,
                        speed: speedRef.current,
                        go_to_previous: false,
                        stop: !itestateRef.current,
                        user_bounds: bounds,
                    };
                    resp = respContinue;
                }
                if (prevRef.current === true) {
                    const respGoPrev = {
                        ideal: activeProblemInfo.ideal,
                        nadir: activeProblemInfo.nadir,
                        reachable_ub: dataArchive[currentStep - 1].lowerBounds.flatMap(
                            (d: number[]) => [d[currentStep - 1]]
                        ),
                        reachable_lb: dataArchive[currentStep - 1].upperBounds.flatMap(
                            (d: number[]) => [d[currentStep - 1]]
                        ),
                        reference_point: refe,
                        speed: speedRef.current,
                        go_to_previous: true,
                        stop: !itestateRef.current,
                        user_bounds: bounds,
                        step_number: dataArchive[currentStep - 1].stepsTaken,
                        reachable_idx: dataArchive[currentStep - 1].reachableIdx, // to dataArc
                        steps_remaining: dataArchive[currentStep - 1].stepsRemaining, // TODO: does it need to come from archive + possible bug with not being 0
                        distance: dataArchive[currentStep - 1].distance,
                        allowed_speeds: [1, 2, 3, 4, 5],
                        current_speed: speedRef.current,
                        navigation_point: dataArchive[currentStep - 1].navigationPoint, // to dataArc
                    };
                    resp = respGoPrev;
                }

                // Guess im ok until this
                try {
                    console.log(`Trying to iterate with ${refe}`);
                    if (resp === undefined) {
                        console.log(`Trying to iterate with undefined ${resp}`);
                        return;
                    }
                    const res = await fetch(`${apiUrl}/method/control`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${tokens.access}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            response: resp,
                        }),
                    });

                    if (res.status === 200) {
                        // ok
                        const body = await res.json();
                        const response = body.response;
                        //console.log("vastaus", response);

                        // TODO: 
                        const dataArchive = dRef.current;
                        if (dataArchive === undefined) {
                            console.log("not ok, dataArchive not defined")
                            return;
                        }
                        // hacky way to remove the last indexes of all the sublists and then pop the last index of dataArchive aswell.
                        // have to be done when backtracking to avoid having same two steps (with same distance etc) in a row.
                        if (prevRef.current === true && currentStep != 1) {
                            popLast(dataArchive); // pop last of arrays
                            dataArchive.pop(); // pop last data array
                            //SetDataArchive(dataArchive!); // not sure if does anything, not needed
                        }

                        SetPrevious(false)
                        // TODO: concatting here brings the above issue, so if done otherway could be avoided.
                        const newArchiveData: NavigationData = {
                            upperBounds: body.response.reachable_lb.map(
                                (d: number, i: number) => {
                                    return dataArchive[dataArchive.length - 1].upperBounds[
                                        i
                                    ].concat(d);
                                }
                            ),
                            lowerBounds: body.response.reachable_ub.map(
                                (d: number, i: number) => {
                                    return dataArchive[dataArchive.length - 1].lowerBounds[
                                        i
                                    ].concat(d);
                                }
                            ),
                            referencePoints: refe.map((d: number, i: number) => {
                                return dataArchive[dataArchive.length - 1].referencePoints[
                                    i
                                ].concat(d);
                            }),
                            boundaries: body.response.user_bounds.map(
                                (d: number, i: number) => {
                                    return dataArchive[dataArchive.length - 1].boundaries[
                                        i
                                    ].concat(d);
                                }
                            ),
                            totalSteps: 100,
                            stepsTaken: body.response.step_number,
                            distance: body.response.distance, // check for possible float errors
                            reachableIdx: body.response.reachable_idx,
                            stepsRemaining: body.response.steps_remaining,
                            navigationPoint: body.response.navigation_point,
                        };

                        SetDataArchive((dataArchive) => [...dataArchive!, newArchiveData]);

                        // TODO: here we still draw from the newest data though.
                        const convertedData = convertData(
                            newArchiveData,
                            activeProblemInfo!.minimize
                        );
                        SetConvertData(convertedData);
                        SetCurrentStep(convertedData.stepsTaken);
                        // update referencePoints  
                        const updatedRef = convertedData!.referencePoints.flatMap((d: number[]) => [
                            d[convertedData!.referencePoints[0].length - 1],
                        ]);
                        SetReferencePoint(updatedRef);
                        const updatedBound = convertedData!.boundaries.flatMap((d: number[]) => [
                            d[convertedData!.boundaries[0].length - 1],
                        ]);
                        SetBoundaryPoint(updatedBound);

                        if (newArchiveData.distance === 100) {
                            console.log("Method finished with 100 steps");
                            SetIterateNavi(false);
                            SetLoading(false);

                            SetShowFinal(true);
                            return;
                        }
                        // hacky way to make speed matter
                        await delay(speedo / speedRef.current!);
                    } else {
                        console.log("Got a response which is not 200");
                    }
                } catch (e) {
                    console.log("Could not iterate nau navi");
                    console.log(e);
                    // do nothing
                }
            }
            SetIterateNavi(false);
            SetLoading(false);
        };
        iterate();
    }, [iterateNavi, SetIterateNavi, itestateRef.current]);

    return (
        <Container>
            <h3 className="mb-2">{"NAUTILUS Navigator method"}</h3>
            {!satisfied && (
                <>
                    <Row>
                        <Col md={2} className="mt-5">
                            {fetchedInfo && (
                                <>
                                    <InputForm
                                        setReferencePoint={(ref: number[]) => {
                                            updatePoint(ref, true);
                                        }}
                                        referencePoint={referencePoint}
                                        nObjectives={activeProblemInfo!.nObjectives}
                                        objectiveNames={activeProblemInfo!.objectiveNames}
                                        ideal={activeProblemInfo!.ideal}
                                        nadir={activeProblemInfo!.nadir}
                                        directions={activeProblemInfo!.minimize}
                                        name={"Reference"}
                                    />
                                    <InputForm
                                        setReferencePoint={(bound: number[]) => {
                                            updatePoint(bound, false);
                                        }}
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
                                    {/* console.log("ennen piirtoa archive", dataArchive) */}
                                    {/*console.log("ennen piirtoa conv data", convertedData) */}
                                    <NavigationBars
                                        problemInfo={trueProbData(activeProblemInfo!)}
                                        problemData={convertedData!}
                                        referencePoints={convertedData!.referencePoints}
                                        boundaries={convertedData!.boundaries}
                                        handleReferencePoint={(ref: number[][]) => {
                                            let refe = ref.map(
                                                (d) => d[convertedData!.referencePoints[0].length - 1]
                                            );
                                            updatePoint(refe, true);
                                        }}
                                        handleBound={(bound: number[][]) => {
                                            let boundy = bound.map(
                                                (d) => d[convertedData!.boundaries[0].length - 1]
                                            );
                                            updatePoint(boundy, false);
                                        }}
                                        handleGoBack={(s: number) => {
                                            // if iteration have to stop iteration first
                                            if (itestateRef.current === true) {
                                                SetIterateNavi(false);
                                            }
                                            //console.log("ASKEL", s)
                                            // checks for step being correct etc..
                                            if (s > currentStep) {
                                                // do nothing
                                                console.log("cant step to the future")
                                            }
                                            if (s < 1) {
                                                console.log("not possible value")
                                            }
                                            SetCurrentStep(s)
                                            goBack(s)
                                        }}
                                        dimensionsMaybe={dims}
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={2} className="mt-auto">
                            <Card border="light">
                                <Card.Body>Iteration Speed</Card.Body>
                                <Slider
                                    value={speed}
                                    onChange={(_, val) => {
                                        SetSpeed(val as number);
                                    }}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="off"
                                    step={1}
                                    marks={[
                                        {
                                            value: 1,
                                            label: "1",
                                        },
                                        {
                                            value: 2,
                                            label: "2",
                                        },
                                        {
                                            value: 3,
                                            label: "3",
                                        },
                                        {
                                            value: 4,
                                            label: "4",
                                        },
                                        {
                                            value: 5,
                                            label: "5",
                                        },
                                    ]}
                                    min={1}
                                    max={5}
                                />
                            </Card>
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
                                <Button disabled={false} size={"lg"} onClick={toggleIteration}>
                                    Start Navigation
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
                        <Col>
                            {showFinal && (
                                <>
                                    <Button size={"lg"} onClick={checkSolution}>
                                        Check Solution
                                    </Button>
                                    <textarea name="finalVariables" defaultValue={JSON.stringify(finalVariables)}>
                                    </textarea>
                                </>
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

