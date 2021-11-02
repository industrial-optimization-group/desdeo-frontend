import { Button, Offcanvas, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AiOutlineMenu, AiFillHome, AiFillControl, AiFillThunderbolt, AiFillPlusCircle, AiFillFastForward } from "react-icons/ai";

function NavigationBar({
  isLoggedIn,
  loggedAs,
}: {
  isLoggedIn: boolean;
  loggedAs: string;
}) {
  const [show, SetShow] = useState<boolean>(false);

  const handleShow = () => SetShow(true);
  const handleClose = () => SetShow(false);

  return (
    <>
      <Button onClick={handleShow} size="lg" id="menu-button">
        <AiOutlineMenu />
      </Button>
      <Container>
      </Container>
      <Offcanvas show={show} onHide={handleClose} id="menu">
        <Offcanvas.Header closeButton>
          <img
            alt="desdeo-logo"
            src="desdeo_logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          <Offcanvas.Title>DESDEO</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {isLoggedIn &&
            <ul id="menu-list">
              <li><Link to="/" className="menu-link" onClick={handleClose}><AiFillHome />{"\tHome"}</Link></li>
              <li><Link to="/problem/create" className="menu-link" onClick={handleClose}><AiFillThunderbolt />{"\tProblems"}</Link></li>
              <li><Link to="/method/create" className="menu-link" onClick={handleClose}><AiFillControl />{"\tInteractive methods"}</Link></li>
            </ul>
          }
          {!isLoggedIn &&
            <ul id="menu-list">
              <li><Link to="/login" className="menu-link" onClick={handleClose}><AiFillFastForward />{"\tLogin"}</Link></li>
              <li><Link to="/register" className="menu-link" onClick={handleClose}><AiFillPlusCircle />{"\tRegister"}</Link></li>
            </ul>
          }
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
  /*
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
*/
}

export default NavigationBar;
