import React, { useEffect, useState } from "react";
import {
  Container,
  ListGroup,
  Tab,
  Row,
  Col,
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
        <ListGroup>
          <ListGroup.Item variant="dark">
            <Row>
              {objectiveData.names.map((name, i) => {
                return (
                  <Col>{`${name} (${
                    objectiveData.directions[i] === 1 ? "min" : "max"
                  })`}</Col>
                );
              })}
              <Col>Lower bound</Col>
              <Col>Upper bound</Col>
              <Col>Distance</Col>
            </Row>
          </ListGroup.Item>
          {data.map((datum, index) => {
            return (
              <ListGroup.Item
                action
                variant={index === selectedIndex ? "info" : ""}
                onClick={() => SetKey(index)}
                key={index}
              >
                <Row>
                  {datum.value.map((value) => {
                    return (
                      <Col>{`${
                        objectiveData.directions[index] === 1
                          ? value.toPrecision(4)
                          : -value.toPrecision(4)
                      }`}</Col>
                    );
                  })}
                  <Col>Extra!</Col>
                  <Col>Extra!</Col>
                  <Col>Extra!</Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTableNautilus;
