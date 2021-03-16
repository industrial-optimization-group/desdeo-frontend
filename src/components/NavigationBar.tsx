import React from "react";

import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <Container>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">
          <img
            alt=""
            src="desdeo_logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          DESDEO
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/login">
              Login
            </Nav.Link>
            <Nav.Link as={Link} to="/register">
              Register
            </Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item>Action</NavDropdown.Item>
              <NavDropdown.Item>Another action</NavDropdown.Item>
              <NavDropdown.Item>Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item>Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}

export default NavigationBar;
