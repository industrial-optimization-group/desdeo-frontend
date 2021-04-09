import React, { useEffect, useState } from "react";
import { Container, ListGroup, Tab, Row, Col } from "react-bootstrap";
import { ObjectiveData } from "../types/ProblemTypes";

interface SolutionTableProps {
  objectiveData: ObjectiveData;
  setSolution: React.Dispatch<React.SetStateAction<number[]>>;
}

function SolutionTable({ objectiveData, setSolution }: SolutionTableProps) {
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
        <h4>Alternative solutions</h4>
        <ListGroup>
          {data.map((datum, index) => {
            return (
              <ListGroup.Item
                action
                onClick={() => SetKey(`${index}`)}
                key={index}
              >
                {`${JSON.stringify(datum.value)}`}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Tab.Container>
    </Container>
  );
}

export default SolutionTable;
