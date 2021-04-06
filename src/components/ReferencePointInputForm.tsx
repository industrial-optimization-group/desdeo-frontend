import React from "react";

import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
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
  } = useForm<FormData>({ mode: "onBlur" });

  const onSubmit = (data: FormData) => {
    setReferencePoint(data.values);
  };

  return (
    <Form action="" onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        {objectiveNames.map((name, i) => {
          return (
            <div key={`${name}`}>
              <Form.Label key={`labelof${name}`}>{name}</Form.Label>
              <Form.Control
                key={`controlof${name}`}
                name={`values.${i}`}
                defaultValue={referencePoint[i]}
                ref={register({
                  required: true,
                  pattern: {
                    value: /[+-]?([0-9]*[.])?[0-9]+/,
                    message: "Input not recognized as float.",
                  },
                  valueAsNumber: true,
                  validate: {
                    isFloat: (v) =>
                      !Number.isNaN(parseFloat(v)) || "Input must be float",
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
            </div>
          );
        })}
      </Form.Group>
      <Button type="submit">Set</Button>
    </Form>
  );
}

export default ReferencePointInputForm;
