import React from "react";

import { useForm } from "react-hook-form";
import { useState } from "react";

import { Tokens } from "../types/AppTypes";

import { Container, Button, Form } from "react-bootstrap";
import { TupleType } from "typescript";

interface ProblemDefinitionProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
}

interface ProblemData {
  problem_type: string;
  name: string;
  objective_functions: string[];
  objective_names: string[];
  variables: string[];
  variable_initial_values: number[];
  variable_bounds: number[][];
  variable_names: string[];
  ideal: number[];
  nadir: number[];
  minimize: number[];
}

interface ProblemNameAndType {
  name: string;
  type: string;
}

function ProblemDefinition({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
}: ProblemDefinitionProps) {
  const [problemDefined, SetProblemDefined] = useState<boolean>(false);
  const [
    problemNameAndType,
    SetProblemNameAndType,
  ] = useState<ProblemNameAndType>({ name: "", type: "" });
  const { register, handleSubmit, errors } = useForm<ProblemData>();

  if (!isLoggedIn) {
    return (
      <Container>
        <p>You are not logged in. Please login first.</p>
      </Container>
    );
  }

  const dummyProblem: ProblemData = {
    problem_type: "Analytical",
    name: "TestProblem",
    objective_functions: ["2*x+y", "x+2*y/z", "x+y+z"],
    objective_names: ["profit", "loss", "impact"],
    variables: ["x", "y", "z"],
    variable_initial_values: [5, 2, 3],
    variable_bounds: [
      [-5, 5],
      [-15, 15],
      [-20, 20],
    ],
    variable_names: ["speed", "luck", "dex"],
    ideal: [10, 20, 30],
    nadir: [-10, -20, -30],
    minimize: [1, -1, 1],
  };

  const onSubmit = async (data: ProblemData) => {
    console.log(JSON.stringify(dummyProblem));

    try {
      const res = await fetch(`${apiUrl}/problem/create`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify(dummyProblem),
      });
      if (res.status == 201) {
        //status ok
        const body = await res.json();
        SetProblemNameAndType({ name: body.name, type: body.problem_type });
        SetProblemDefined(true);
      }
    } catch (e) {
      console.log("not ok");
      console.log(e);
      // do nothing
    }
  };

  return (
    <>
      {!problemDefined && (
        <Container>
          <Form action="" onSubmit={handleSubmit(onSubmit)}>
            <Button type="submit">Define dummy problem</Button>
          </Form>
        </Container>
      )}
      {problemDefined && (
        <Container>
          <p>{`Problem '${problemNameAndType.name}' of type '${problemNameAndType.type}' successfully defined!`}</p>
          <Button onClick={() => SetProblemDefined(false)}>
            Define a new problem
          </Button>
        </Container>
      )}
    </>
  );
}

export default ProblemDefinition;
