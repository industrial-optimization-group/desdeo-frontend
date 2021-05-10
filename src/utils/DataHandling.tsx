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
  const data: ObjectiveData = {
    values: datums,
    names: info.objectiveNames,
    directions: info.minimize,
    ideal: info.ideal,
    nadir: info.nadir,
  };

  return data;
}

function ToTrueValues(data: ObjectiveData): ObjectiveData {
  const newDatums: ObjectiveDatum[] = data.values.map((d, i) => {
    return {
      value:
        data.directions[i] === 1
          ? (d.value as number[])
          : d.value.map((x) => -x),
      selected: false,
    };
  });

  const newData: ObjectiveData = {
    values: newDatums,
    names: data.names,
    directions: data.directions,
    ideal: data.ideal.map((v, i) => (data.directions[i] === 1 ? v : -v)),
    nadir: data.nadir.map((v, i) => (data.directions[i] === 1 ? v : -v)),
  };
  return newData;
}

export { ParseSolutions, ToTrueValues };
