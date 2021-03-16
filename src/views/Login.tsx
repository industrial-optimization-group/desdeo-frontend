import React from "react";

import { useForm } from "react-hook-form";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";

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

  const popover = (
    <Popover id="popover-basic">
      <Popover.Title as="h3">Don't have credentials yet?</Popover.Title>
      <Popover.Content>
        Registration is currently not available and credentials must be
        requested by sending an email to xxx@yyy.zz.
      </Popover.Content>
    </Popover>
  );

  return (
    <Container>
      <Row>
        <Col>
          <h2>Login</h2>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
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
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={popover}
            // Transition false to hide the warning: Warning: findDOMNode is deprecated in StrictMode.
            // this is also why the functional form of OverlayTrigger is used.
            transition={false}
          >
            {({ ref, ...triggerHandler }) => (
              <Button
                className="mt-1"
                variant="secondary"
                {...triggerHandler}
                ref={ref}
                size="sm"
              >
                Help
              </Button>
            )}
          </OverlayTrigger>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
