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
    setIndices(keys);
  }, [keys]);

  useEffect(() => {
    SetKeys(activeIndices);
  }, [activeIndices]);

  return (
    <Container>
      <Tab.Container
        id="table-of-alternatives"
        /*
        activeKey={keys}
        onSelect={(k) => {
          SetKeys([...keys!, k!]);
        }}
        */
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
          {data.map((datum, index: number) => {
            return (
              <ListGroup.Item
                action
                variant={keys.includes(index) ? "info" : ""}
                onClick={() => {
                  if (keys.includes(index)) {
                    SetKeys(keys.filter((k) => k !== index));
                  } else {
                    SetKeys([...keys, index]);
                  }
                }}
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

export default SolutionTableMultiSelect;
