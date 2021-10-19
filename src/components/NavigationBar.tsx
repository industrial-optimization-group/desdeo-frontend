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
                  <Nav.Item>
                    <Link to="/login" className="nav-link"> Login </Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Link to="/register" className="nav-link"> Register </Link>
                  </Nav.Item>
                </>
              )}
              {isLoggedIn && (
                <>
                  <NavDropdown title="Problem" id="basic-nav-dropdown">
                    <NavDropdown.Item>
                      <Link to="/problem/create" className="nav-link">
                        Define new
                      </Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Link to="/problem/explore" className="nav-link">
                        Explore existing
                      </Link>
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Solve" id="basic-nav-dropdown">
                    <NavDropdown.Item>
                      <Link to="/method/create" className="nav-link">
                        Define method
                      </Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Link to="/method/optimize" className="nav-link">
                        Optimize
                      </Link>
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Item>
                    <Link to="/questionnaire" className="nav-link">
                      Questionaire
                    </Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
            {isLoggedIn && (
              <>
                {`Logged in as user: ${loggedAs}`}{" "}
                <Nav.Item>
                  <Link to="/logout" className="nav-link">
                    Logout
                  </Link>
                </Nav.Item>
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
