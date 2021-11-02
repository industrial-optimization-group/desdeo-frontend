import React from "react";
import { Link } from "react-router-dom";

import { Container, Row, Col, Button, Card } from "react-bootstrap";

function LandingPage() {
  return <Container>
    <Row className="justify-content-md-left">
      <Col xs lg="2">
        <Card className="card" as={Link} to="/problem/create">
          <Card.Img variant="top" alt="problem-icon" src="desdeo_logo.png" />
          <Card.Body>
            <Card.Title>Define a new problem</Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col xs lg="2">
        <Card className="card" as={Link} to="/problem/explore">
          <Card.Img variant="top" alt="problem-icon" src="desdeo_logo.png" />
          <Card.Body >
            <Card.Title>Explore an existing problem</Card.Title>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="justify-content-md-left">
      <Col xs lg="2">
        <Card className="card" as={Link} to="/problem/create">
          <Card.Img variant="top" alt="problem-icon" src="desdeo_logo.png" />
          <Card.Body>
            <Card.Title>Define a new problem</Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col xs lg="2">
        <Card className="card" as={Link} to="/problem/explore">
          <Card.Img variant="top" alt="problem-icon" src="desdeo_logo.png" />
          <Card.Body >
            <Card.Title>Explore an existing problem</Card.Title>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>;
}

export default LandingPage;
