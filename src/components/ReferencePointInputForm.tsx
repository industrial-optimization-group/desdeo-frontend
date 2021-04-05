import React from "react";

import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

interface FormData {
  values: number[];
}

interface ReferencePointInputFormProps {
  setReferencePoint: React.Dispatch<React.SetStateAction<number[]>>;
  referencePoint: number[];
  nObjectives: number;
  objectiveNames: string[];
}

function ReferencePointInputForm({
  setReferencePoint,
  referencePoint,
  nObjectives,
  objectiveNames,
}: ReferencePointInputFormProps) {
  const { register, handleSubmit, errors } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form action="" onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        <Form.Label>Objective</Form.Label>
        <Form.Control
          type="number"
          name="values.0"
          ref={register({ required: true })}
        />
        <Form.Label>Objective</Form.Label>
        <Form.Control
          type="number"
          name="values.1"
          ref={register({ required: true })}
        />
        <Form.Label>Objective</Form.Label>
        <Form.Control
          type="number"
          name="values.2"
          ref={register({ required: true })}
        />
      </Form.Group>
      <Button type="submit">Set</Button>
    </Form>
  );
}

export default ReferencePointInputForm;
