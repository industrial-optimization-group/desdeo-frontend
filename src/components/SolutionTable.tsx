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

interface SolutionTableProps {
  objectiveData: ObjectiveData;
  setSolution: React.Dispatch<React.SetStateAction<number[]>>;
  tableTitle: string;
}

function SolutionTable({
  objectiveData,
  setSolution,
  tableTitle,
}: SolutionTableProps) {
  const [key, SetKey] = useState<string | null>("0");
  const [data, SetData] = useState(objectiveData.values);

  useEffect(() => {
    SetData(objectiveData.values);
  }, [objectiveData]);

  useEffect(() => {
    if (key === null) {
      return;
    }
    setSolution(data[parseInt(key!)].value);
  }, [key]);

  return (
    <Container>
      <Tab.Container
        id="table-of-alternatives"
        activeKey={key}
        onSelect={(k) => {
          SetKey(k);
        }}
      >
        <h4>{tableTitle}</h4>
        <ListGroup>
          <ListGroup.Item variant="dark">
            <Row>
              {objectiveData.names.map((name) => {
                return <Col>{name}</Col>;
              })}
            </Row>
          </ListGroup.Item>
          {data.map((datum, index) => {
            return (
              <ListGroup.Item
                action
                variant={index === parseInt(key!) ? "info" : ""}
                onClick={() => SetKey(`${index}`)}
                key={index}
              >
                <Row>
                  {datum.value.map((value) => {
                    return <Col>{value.toPrecision(4)}</Col>;
                  })}
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTable;
