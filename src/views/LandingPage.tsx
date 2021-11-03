import React from "react";
import { Link } from "react-router-dom";

import { Container, Row, Col, Button, Card } from "react-bootstrap";

function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  return <>
    <Container>
      <h1>Welcome to DESDEO!</h1>
      {isLoggedIn && (
        <>
          <h4>Start by defining or exploring a problem, or initialize a new method and start optimizing.</h4>
          <Row className="justify-content-md-left">
            <Col>
              <Card className="card" as={Link} to="/problem/create">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body>
                  <Card.Title>Define a new problem</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="card" as={Link} to="/problem/explore">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body >
                  <Card.Title>Explore an existing problem</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="justify-content-md-left">
            <Col>
              <Card className="card" as={Link} to="/method/create">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body>
                  <Card.Title>Initialize a new method</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="card" as={Link} to="/method/control">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body >
                  <Card.Title>Start optimizing</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      {!isLoggedIn && (
        <>
          <h4>Login if you are an existing user. Register or take a tour if you are new.</h4>
          <Row className="justify-content-md-left">
            <Col>
              <Card className="card" as={Link} to="/login">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body>
                  <Card.Title>Login</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="card" as={Link} to="/register">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body >
                  <Card.Title>Register a new user</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="justify-content-md-left">
            <Col>
              <Card className="card" as={Link} to="/">
                <Card.Img className="card-image" variant="top" alt="problem-icon" src="desdeo_logo.png" />
                <Card.Body >
                  <Card.Title>Take a tour</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  </>
}

export default LandingPage;
