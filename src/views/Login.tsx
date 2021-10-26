import React from "react";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { Tokens } from "../types/AppTypes";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";

interface FormData {
  username: string;
  password: string;
}

export const Login = ({
  apiUrl,
  setIsLoggedIn,
  setLoggedAs,
  setTokens,
}: {
  apiUrl: string;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setLoggedAs: React.Dispatch<React.SetStateAction<string>>;
  setTokens: React.Dispatch<React.SetStateAction<Tokens>>;
}) => {
  const { register, handleSubmit, errors } = useForm<FormData>();
  const [loginOk, SetLoginOk] = useState<boolean>(false);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status == 200) {
        // Status is ok
        setLoggedAs(data.username);
        setIsLoggedIn(true);
        SetLoginOk(true);

        const body = await res.json();
        setTokens({ access: body.access_token, refresh: body.refresh_token });
      }
    } catch (e) {
      console.log(e);
      // Do nothing
    }
  };

  return (
    <>
      {!loginOk && (
        <Container>
          <Row>
            <Col>
              <h2>Login</h2>
            </Col>
          </Row>
          <Row>
            <Col md={{ span: 6, offset: 3 }}>
              <Form
                className="mx-6"
                action=""
                onSubmit={handleSubmit(onSubmit)}
              >
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="username"
                    placeholder="username"
                    name="username"
                    ref={register({ required: { value: true, message: "Username is required." } })}
                    isInvalid={errors.username !== undefined}
                  />
                  {errors.username &&
                    <Form.Control.Feedback type="invalid">{`${errors.username.message}`}</Form.Control.Feedback>}
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="password"
                    name="password"
                    ref={register({ required: { value: true, message: "Password is required." } })}
                    isInvalid={errors.password !== undefined}
                  />
                  {errors.password &&
                    <Form.Control.Feedback type="invalid">{`${errors.password.message}`}</Form.Control.Feedback>}
                </Form.Group>
                <Button className="mt-1" type="submit">Submit</Button>
              </Form>
            </Col>
          </Row>
        </Container>
      )}
      {loginOk && (
        <Container>
          {`Logged in`}
          <Redirect to="/" />
        </Container>
      )}
    </>
  );
};

export default Login;
