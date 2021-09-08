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

// järkevämpää olisi täällä vain käsitellä yhtä pistettä eikä historiaa, mutta saa nhädä miten pelaa sitten yhteen.,
interface InputFormProps {
  setReferencePoint: React.Dispatch<React.SetStateAction<number[]>>;
  setBoundaryPoint: React.Dispatch<React.SetStateAction<number[]>>;
  referencePoint: number[];
  boundary: number[];
  nObjectives: number;
  objectiveNames: string[];
  ideal: number[];
  nadir: number[];
  directions: MinOrMax[];
}

function InputForm({
  setReferencePoint,
  setBoundaryPoint,
  referencePoint,
  boundary,
  nObjectives,
  objectiveNames,
  ideal,
  nadir,
  directions,
}: InputFormProps) {
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
  }, [referencePoint, boundary]);

  const onSubmit = (data: FormData) => {
    setReferencePoint(directions.map((d, i) => d * data.values[i]));
    setBoundaryPoint(directions.map((d, i) => d * data.values[i]));
  };

  console.log("called form", JSON.stringify(referencePoint));
  console.log("called form", JSON.stringify(boundary));

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
                      {(directions[i] === 1 ? ideal[i] : -nadir[i]).toPrecision(
                        4
                      )}
                    </Col>
                    <Col>
                      <Form.Control
                        key={`controlof${name}`}
                        name={`values.${i}`}
                        defaultValue={`${directions[i] === 1
                          ? referencePoint[i].toPrecision(4)
                          : -referencePoint[i].toPrecision(4)
                          }`}
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
                            value: directions[i] === 1 ? ideal[i] : -nadir[i],
                            message: `Value too small. Must be greater than ${directions[i] === 1 ? ideal[i] : -nadir[i]
                              }`,
                          },
                          max: {
                            value: directions[i] === -1 ? -ideal[i] : nadir[i],
                            message: `Value too too large. Must be less than ${directions[i] === -1 ? -ideal[i] : nadir[i]
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
                    <Col>
                      <Form.Control
                        key={`controlof${name}`}
                        name={`bounds.${i}`}
                        defaultValue={`${directions[i] === 1
                          ? boundary[i].toPrecision(4)
                          : -boundary[i].toPrecision(4)
                          }`}
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
                            value: directions[i] === 1 ? ideal[i] : -nadir[i],
                            message: `Value too small. Must be greater than ${directions[i] === 1 ? ideal[i] : -nadir[i]
                              }`,
                          },
                          max: {
                            value: directions[i] === -1 ? -ideal[i] : nadir[i],
                            message: `Value too too large. Must be less than ${directions[i] === -1 ? -ideal[i] : nadir[i]
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
                      {(directions[i] === -1
                        ? -ideal[i]
                        : nadir[i]
                      ).toPrecision(4)}
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

export default InputForm;
