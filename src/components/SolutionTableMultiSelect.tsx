import React, { useEffect, useState } from "react";
import { Container, Tab, Table } from "react-bootstrap";
import { ObjectiveData } from "../types/ProblemTypes";

interface SolutionTableMultiSelectProps {
  objectiveData: ObjectiveData;
  activeIndices: number[];
  setIndices: React.Dispatch<React.SetStateAction<number[]>>;
  tableTitle: string;
}

function SolutionTableMultiSelect({
  objectiveData,
  activeIndices,
  setIndices,
  tableTitle,
}: SolutionTableMultiSelectProps) {
  const [keys, SetKeys] = useState<number[]>(activeIndices);
  const [data, SetData] = useState(objectiveData.values);

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
            })}
          </tbody>
        </Table>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTableMultiSelect;
