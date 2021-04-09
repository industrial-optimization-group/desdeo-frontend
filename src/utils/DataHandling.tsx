import { InferencePriority } from "typescript";
import {
  ObjectiveDatum,
  ObjectiveData,
  ProblemInfo,
} from "../types/ProblemTypes";

function ParseSolutions(
  solutions: number[][],
  info: ProblemInfo
): ObjectiveData {
  const datums: ObjectiveDatum[] = solutions.map((solution, i) => {
    return { value: solution, selected: false };
  });
  console.log(solutions);
  const data: ObjectiveData = {
    values: datums,
    names: info.objectiveNames,
    directions: info.minimize,
    ideal: info.ideal,
    nadir: info.nadir,
  };

  console.log(data);

  return data;
}

export { ParseSolutions };
