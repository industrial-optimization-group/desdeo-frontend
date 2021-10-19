import React from "react";

import { useForm } from "react-hook-form";
import { useState } from "react";

import { Tokens } from "../types/AppTypes";

import { Alert, Container, Button, Form } from "react-bootstrap";
import { useDropzone } from 'react-dropzone';
import { useCallback } from "react";

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const textStr = reader.result
        console.log(textStr)
      }
      reader.readAsText(file)
    })
  }, [])

  const {acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: ".csv",
    maxFiles: 1,
    onDropRejected: (fileRejection, event) => alert("File not accepted!"),
    onDrop: onDrop
  });

  if (!isLoggedIn) {
    return (
      <Container>
        <p>You are not logged in. Please login first.</p>
      </Container>
    );
  }

  const dummyProblem: ProblemData = {
    problem_type: "Analytical",
    name: "River pollution problem (correct)",
    objective_functions: [
      "-4.07 - 2.27*x",
      "-2.60 - 0.03*x - 0.02*y - 0.01/(1.39 - x**2) - 0.30/(1.39 + y**2)",
      "-8.21 + 0.71 / (1.09 - x**2)",
      "-0.96 - 0.96/(1.09 - y**2)",
    ],
    objective_names: ["WQ City", "WQ Border", "ROI City", "Tax City"],
    variables: ["x", "y"],
    variable_initial_values: [0.5, 0.5],
    variable_bounds: [
      [0.3, 1.0],
      [0.3, 1.0],
    ],
    variable_names: ["x_1", "x_2"],
    ideal: [-6.339, -2.864, -7.499, -11.626],
    nadir: [-4.751, -2.767, -0.321, -1.92],
    minimize: [1, 1, 1, 1],
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
          <section className="container">
            <div {...getRootProps({className: 'dropzpne'})}>
              <input {...getInputProps()}/>
              <p>Drag 'n' drop files here, or click to select files</p>
            </div>
          </section>
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
