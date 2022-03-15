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
                return <Col>{`${name} LB`}</Col>;
              })}
              {objectiveData.names.map((name, i) => {
                return <Col>{`${name} UB`}</Col>;
              })}
              <Col>{"Distance"}</Col>
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
                  {(objectiveData.directions[index] === 1
                    ? lowerBounds
                    : upperBounds)[index].map((bound) => {
                    return (
                      <>
                        <Col>
                          {(objectiveData.directions[index] === 1
                            ? bound
                            : -bound
                          ).toPrecision(4)}
                        </Col>
                      </>
                    );
                  })}
                  {(objectiveData.directions[index] === 1
                    ? upperBounds
                    : lowerBounds)[index].map((bound) => {
                    return (
                      <>
                        <Col>
                          {(objectiveData.directions[index] === 1
                            ? bound
                            : -bound
                          ).toPrecision(4)}
                        </Col>
                      </>
                    );
                  })}
                  <Col>{distances[index].toPrecision(2)}</Col>
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
