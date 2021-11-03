import { Button, Col, Offcanvas, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AiOutlineMenu, AiFillHome, AiFillControl, AiOutlinePlusSquare, AiFillPlusCircle, AiOutlineFunction, AiOutlineLogout, AiOutlineLogin, AiOutlineSearch } from "react-icons/ai";

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
    <Container id="navigation-bar" fluid>
      <Row>
        <Col xs="auto" lg="auto">
          <Button onClick={handleShow} size="lg" id="menu-button">
            <AiOutlineMenu />
          </Button>
        </Col>
        <Col xs="auto" lg="auto" id="login-name">{isLoggedIn ? (<>{`Logged in as ${loggedAs}`}<Link id="logout-button" to="/logout"> (logout)</Link></>) : "Not logged in"}</Col>
      </Row>
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
              <li><Link to="/problem/create" className="menu-link" onClick={handleClose}><AiOutlineFunction />{"\tCreate problems"}</Link></li>
              <li><Link to="/problem/explore" className="menu-link" onClick={handleClose}><AiOutlineSearch />{"\tExplore problems"}</Link></li>
              <li><Link to="/method/create" className="menu-link" onClick={handleClose}><AiOutlinePlusSquare />{"\tInitialize a new method"}</Link></li>
              <li><Link to="/method/optimize" className="menu-link" onClick={handleClose}><AiFillControl />{"\tStart optimizing"}</Link></li>
              <li></li>
              <li><Link to="/logout" className="menu-link" onClick={handleClose}><AiOutlineLogout />{"\tLogout"}</Link></li>
            </ul>
          }
          {!isLoggedIn &&
            <ul id="menu-list">
              <li><Link to="/login" className="menu-link" onClick={handleClose}><AiOutlineLogin />{"\tLogin"}</Link></li>
              <li><Link to="/register" className="menu-link" onClick={handleClose}><AiFillPlusCircle />{"\tRegister"}</Link></li>
            </ul>
          }
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
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
