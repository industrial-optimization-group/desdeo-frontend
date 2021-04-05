import "react";

type ProblemType = "Analytical";
type MinOrMax = 1 | -1;

interface ProblemInfo {
  problemId: number;
  problemName: string;
  problemType: ProblemType;
  objectiveNames: string[];
  variableNames: string[];
  nObjectives: number;
  ideal: number[];
  nadir: number[];
  minimize: MinOrMax[];
}

// one objective vector
interface ObjectiveDatum {
  selected: boolean;
  value: number[];
}

interface ObjectiveData {
  values: ObjectiveDatum[];
  names: string[];
  directions: MinOrMax[];
  ideal: number[];
  nadir: number[];
}

export type {
  ProblemInfo,
  ProblemType,
  MinOrMax,
  ObjectiveData,
  ObjectiveDatum,
};
