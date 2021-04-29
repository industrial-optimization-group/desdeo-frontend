import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import { MinOrMax } from "../types/ProblemTypes";
import { ErrorMessage } from "@hookform/error-message";

interface FormData {
  values: number[];
}

interface ReferencePointInputFormProps {
  setReferencePoint: React.Dispatch<React.SetStateAction<number[]>>;
  referencePoint: number[];
  nObjectives: number;
  objectiveNames: string[];
  ideal: number[];
  nadir: number[];
  directions: MinOrMax[];
}

function ReferencePointInputForm({
  setReferencePoint,
  referencePoint,
  nObjectives,
  objectiveNames,
  ideal,
  nadir,
  directions,
}: ReferencePointInputFormProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormData>({
    mode: "onBlur",
  });
  useEffect(() => {
    reset();
  }, [referencePoint]);

  const onSubmit = (data: FormData) => {
    setReferencePoint(data.values);
  };

  console.log("called form", JSON.stringify(referencePoint));

  return (
    <Form action="" onSubmit={handleSubmit(onSubmit)}>
      <ListGroup>
        <ListGroup.Item variant="dark">
          <Row>
            <Col sm={3}>Min</Col>
            <Col>Value</Col>
            <Col sm={3}>Max</Col>
          </Row>
        </ListGroup.Item>
        <ListGroup.Item>
          <Form.Group>
            {objectiveNames.map((name, i) => {
              return (
                <div key={`${name}`}>
                  <Form.Label column="sm" key={`labelof${name}`}>
                    {name}
                  </Form.Label>
                  <Row>
                    <Col sm={3}>
                      {(directions[i] === 1 ? ideal[i] : nadir[i]).toPrecision(
                        4
                      )}
                    </Col>
                    <Col>
                      <Form.Control
                        key={`controlof${name}`}
                        name={`values.${i}`}
                        defaultValue={`${referencePoint[i].toPrecision(4)}`}
                        ref={register({
                          required: true,
                          pattern: {
                            value: /[+-]?([0-9]*[.])?[0-9]+/,
                            message: "Input not recognized as float.",
                          },
                          valueAsNumber: true,
                          validate: {
                            isFloat: (v) =>
                              !Number.isNaN(parseFloat(v)) ||
                              "Input must be float",
                          },
                          min: {
                            value: directions[i] === 1 ? ideal[i] : nadir[i],
                            message: `Value too small. Must be greater than ${
                              directions[i] === 1 ? ideal[i] : nadir[i]
                            }`,
                          },
                          max: {
                            value: directions[i] === -1 ? ideal[i] : nadir[i],
                            message: `Value too too large. Must be less than ${
                              directions[i] === -1 ? ideal[i] : nadir[i]
                            }`,
                          },
                        })}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`values.${i}`}
                        render={({ message }) => <p>{message}</p>}
                      />
                    </Col>
                    <Col sm={3}>
                      {(directions[i] === -1 ? ideal[i] : nadir[i]).toPrecision(
                        4
                      )}
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Form.Group>
        </ListGroup.Item>
        <Button type="submit">Set</Button>
      </ListGroup>
    </Form>
  );
}

export default ReferencePointInputForm;
