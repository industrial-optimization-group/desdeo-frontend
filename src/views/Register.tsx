import { Button, Container, Col, Form, FormControl, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { appendErrors, useForm } from "react-hook-form";
import { formatDiagnosticsWithColorAndContext } from "typescript";

interface FormData {
  username: string;
  password: string;
  passwordConfirm: string;
}

function Register({ apiUrl }: { apiUrl: string }) {
  const { register, handleSubmit, errors, getValues } = useForm<FormData>({ mode: "all" });

  const onSubmit = (data: FormData) => {
    console.log("lol")
    console.log(getValues("password"));
    console.log(getValues("passwordConfirm"));
  };

  return (
    <Container>
      <Row><Col><h2>Register a new user</h2></Col></Row>
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
                ref={register({ required: { value: true, message: "The username is required." } })}
                isInvalid={errors.username !== undefined}
              />
              {errors.username &&
                <Form.Control.Feedback type="invalid">{`${errors.username.message}`}</Form.Control.Feedback>}
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="password"
                name="password"
                ref={register({ required: { value: true, message: "Password required." }, validate: value => value.length > 5 || "Password too short. Password must be at least 6 characters long." })}
                isInvalid={errors.password !== undefined}
              />
              {errors.password &&
                <Form.Control.Feedback type="invalid">{`${errors.password.message}`}</Form.Control.Feedback>}
              <Form.Label>Repeat password</Form.Label>
              <Form.Control
                type="password"
                placeholder="confirm password"
                name="passwordConfirm"
                ref={register({ required: { value: true, message: "Password confirmation required." }, validate: value => value === getValues("password") || "Passwords do not match!" })}
                isInvalid={errors.passwordConfirm !== undefined}
              />
              {errors.passwordConfirm &&
                <Form.Control.Feedback type="invalid">{`${errors.passwordConfirm.message}`}</Form.Control.Feedback>}
            </Form.Group>
            <Button className="mt-1" type="submit">Register</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
