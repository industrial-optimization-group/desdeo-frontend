import React, { useEffect, useState } from "react";
import {
  Container,
  ListGroup,
  Tab,
  Row,
  Col,
  Table,
  ListGroupItem,
} from "react-bootstrap";
import { ObjectiveData } from "../types/ProblemTypes";

interface SolutionTableNautilusProps {
  objectiveData: ObjectiveData;
  lowerBounds: Number[][];
  upperBounds: Number[][];
  distances: Number[];
  setIndex: (x: number) => void;
  selectedIndex: number;
  tableTitle: string;
}

function SolutionTableNautilus({
  objectiveData,
  lowerBounds,
  upperBounds,
  distances,
  setIndex,
  selectedIndex,
  tableTitle,
}: SolutionTableNautilusProps) {
  const [key, SetKey] = useState<number>(selectedIndex);
  const [data, SetData] = useState(objectiveData.values);

  useEffect(() => {
    SetData(objectiveData.values);
  }, [objectiveData]);

  useEffect(() => {
    setIndex(key);
  }, [key]);

  useEffect(() => {
    SetKey(selectedIndex);
  }, [selectedIndex]);

  return (
    <Container>
      <Tab.Container id="table-of-alternatives">
        {tableTitle.length > 0 && <h4>{tableTitle}</h4>}
        <Table hover>
          <thead>
            <tr>
              {objectiveData.names.map((name, i) => {
                return (
                  <>
                    <th colSpan={2}>{`${name}`}</th>
                    <th></th>
                  </>
                );
              })}
              <th>{"Distance"}</th>
            </tr>
            <tr>
              {objectiveData.names.map((name, i) => {
                return (
                  <>
                    <th>LB</th>
                    <th>UB</th>
                    <th></th>
                  </>
                );
              })}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum, index) => {
              return (
                <tr
                  onClick={() => SetKey(index)}
                  key={index}
                  className={index === selectedIndex ? "tableSelected" : ""}
                >
                  {objectiveData.names.map((_, j) => {
                    const lb = (
                      objectiveData.directions[j] === 1
                        ? lowerBounds
                        : upperBounds
                    )[index][j].toPrecision(4);
                    const ub = (
                      objectiveData.directions[j] === 1
                        ? upperBounds
                        : lowerBounds
                    )[index][j].toPrecision(4);
                    return (
                      <>
                        <td>{objectiveData.directions[j] === 1 ? lb : -lb}</td>
                        <td>{objectiveData.directions[j] === 1 ? ub : -ub}</td>
                        <td></td>
                      </>
                    );
                  })}
                  <td>{distances[index].toPrecision(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTableNautilus;
