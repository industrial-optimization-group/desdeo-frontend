import React from "react";

import { useForm } from "react-hook-form";
import { Form, Button, Container } from "react-bootstrap";

interface FormData {
  username: string;
  password: string;
}

export const Login = () => {
  const { register, handleSubmit, errors } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    console.log(response);
  };

  return (
    <Container>
      <h2>Login</h2>
      <Form className="mx-6" action="" onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="username"
            placeholder="username"
            name="username"
            ref={register({ required: true })}
          />
          {errors.username && "Username is required!"}
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="password"
            name="password"
            ref={register({ required: true })}
          />
        </Form.Group>
        <Button type="submit">Submit</Button>
      </Form>
    </Container>
  );
};

export default Login;
