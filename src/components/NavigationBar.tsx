import React from "react";

import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavigationBar({
  isLoggedIn,
  loggedAs,
}: {
  isLoggedIn: boolean;
  loggedAs: string;
}) {
  return (
    <Container>
      <Navbar bg="light" expand="lg">
        <Container fluid="xl">
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
            <Nav className="me-auto">
              {!isLoggedIn && (
                <>
                  <Nav.Link as={Link} to="/login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    Register
                  </Nav.Link>
                </>
              )}
              {isLoggedIn && (
                <>
                  <NavDropdown title="Problem" id="basic-nav-dropdown">
                    <NavDropdown.Item>
                      <Nav.Link as={Link} to="/problem/create">
                        Define new
                      </Nav.Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Nav.Link as={Link} to="/problem/explore">
                        Explore existing
                      </Nav.Link>
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Solve" id="basic-nav-dropdown">
                    <NavDropdown.Item>
                      <Nav.Link as={Link} to="/method/create">
                        Define method
                      </Nav.Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Nav.Link as={Link} to="/method/optimize">
                        Optimize
                      </Nav.Link>
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/questionnaire">
                    Questionnaire
                  </Nav.Link>
                </>
              )}
            </Nav>
            {isLoggedIn && (
              <>
                {`Logged in as user: ${loggedAs}`}{" "}
                <Nav.Link as={Link} to="/logout">
                  Logout
                </Nav.Link>
              </>
            )}
            {!isLoggedIn && "You are not currently logged in"}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Container>
  );
}

export default NavigationBar;
