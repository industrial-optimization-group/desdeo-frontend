import React from "react";

import { useState, useEffect } from "react";

import { Tokens } from "../types/AppTypes";

import { Container, ListGroup, Tab, Row, Col } from "react-bootstrap";

interface ProblemExploreProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
}

interface Problem {
  id: number;
  name: string;
  problem_type: string;
}

function ProblemExplore({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
}: ProblemExploreProps) {
  const [key, SetKey] = useState<string | null>("0");
  const [problems, SetProblems] = useState<Problem[]>([
    {
      id: 0,
      name: "placeholder",
      problem_type: "test",
    },
  ]);

  const dummy_problems: Problem[] = [
    { id: 0, name: "problem_1", problem_type: "type" },
    { id: 1, name: "problem_2", problem_type: "type" },
    { id: 2, name: "problem_3", problem_type: "type" },
    { id: 3, name: "problem_4", problem_type: "type" },
    { id: 4, name: "problem_5", problem_type: "type" },
    { id: 5, name: "problem_6", problem_type: "type" },
  ];

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${apiUrl}/problem/access`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (res.status == 200) {
          const body = await res.json();
          SetProblems(body.problems);
          // problems set!
        } else {
          console.log(
            `Got return code ${res.status}. Could not fetch problems.`
          );
          // do nothing
        }
      } catch (e) {
        console.log("not ok");
        console.log(e);
        //do nothing
      }
    };

    fetchProblems();
  }, []);

  return (
    <>
      {isLoggedIn && (
        <Container>
          <Tab.Container
            id="list-group-tabs-example"
            // @ts-ignore
            activeKey={key}
            onSelect={(k) => SetKey(k)}
          >
            <Row>
              <Col sm={4}>
                <h4>Select problem</h4>
                <ListGroup>
                  {problems.map((problem, index) => {
                    return (
                      <ListGroup.Item
                        action
                        onClick={() => SetKey(`${index}`)}
                        key={index}
                      >
                        {problem.name}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Col>
              <Col sm={8}>
                <h4>Problem info</h4>
                <Tab.Content>
                  {problems.map((problem, index) => {
                    return (
                      <Tab.Pane eventKey={index} key={index}>
                        {`ID: ${problem.id}; Name: ${problem.name}; Type: ${problem.problem_type}`}
                      </Tab.Pane>
                    );
                  })}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      )}
      {!isLoggedIn && <Container>Please login first.</Container>}
    </>
  );
}

export default ProblemExplore;
