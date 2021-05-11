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
            {!isLoggedIn && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
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
      </Navbar>
    </Container>
  );
}

export default NavigationBar;
