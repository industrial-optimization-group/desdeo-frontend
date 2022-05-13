import React, { useEffect, useState } from "react";
import { Container, Tab, Table } from "react-bootstrap";
import { ObjectiveData, ObjectiveDatum } from "../types/ProblemTypes";

interface SolutionTableMultiSelectProps {
  objectiveData: ObjectiveData;
  activeIndices: number[];
  setIndices: React.Dispatch<React.SetStateAction<number[]>>;
  tableTitle: string;
}

function ArraysAreEqual(a1: number[], a2: number[]): boolean {
  const threshold: number = 1e-3;
  // check that a1 and a2 are of same length
  const differences: number[] = a1.map((value, index) => {
    return Math.abs(value - a2[index]);
  });
  const withinThreshold: boolean[] = differences.map((value) =>
    value < threshold ? true : false
  );

  return withinThreshold.every((value) => value);
}

function checkForSimilarArrays(data: ObjectiveDatum[]): number[] {
  const isSimilarToSomething: number[] = [];

  for (let i = 0; i < data[0].value.length; i++) {
    for (let j = 0; j < data[0].value.length; j++) {
      if (i === j) {
        // do not compare array to itself
        continue;
      }

      if (ArraysAreEqual(data[i].value, data[j].value)) {
        isSimilarToSomething.push(i);
      }
    }
  }
  return isSimilarToSomething;
}

function SolutionTableMultiSelect({
  objectiveData,
  activeIndices,
  setIndices,
  tableTitle,
}: SolutionTableMultiSelectProps) {
  const [keys, SetKeys] = useState<number[]>(activeIndices);
  const [data, SetData] = useState(objectiveData.values);
  const [doNotShow] = useState<number[]>(
    checkForSimilarArrays(objectiveData.values)
  );

  useEffect(() => {
    SetData(objectiveData.values);
  }, [objectiveData]);

  useEffect(() => {
    SetKeys(activeIndices);
  }, [activeIndices]);

  return (
    <Container>
      <Tab.Container id="table-of-alternatives">
        <h4>{tableTitle}</h4>
        <Table hover>
          <thead>
            <tr>
              {objectiveData.names.map((name, i) => {
                return (
                  <th>{`${name} (${
                    objectiveData.directions[i] === 1 ? "min" : "max"
                  })`}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((datum, index: number) => {
              if (doNotShow.includes(index)) {
                return;
              } else {
                return (
                  <tr
                    onClick={() => {
                      if (keys.includes(index)) {
                        setIndices(keys.filter((k) => k !== index));
                      } else {
                        setIndices([...keys, index]);
                      }
                    }}
                    className={keys.includes(index) ? "tableSelected" : ""}
                    key={index}
                  >
                    {datum.value.map((value, i) => {
                      return (
                        <td>
                          {objectiveData.directions[i] === 1
                            ? value.toPrecision(4)
                            : -value.toPrecision(4)}
                        </td>
                      );
                    })}
                  </tr>
                );
              }
            })}
          </tbody>
        </Table>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTableMultiSelect;
