import React from "react";

import { Tokens } from "../types/AppTypes";

import { Container, Button } from "react-bootstrap";

interface ProblemDefinitionProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
}

function ProblemDefinition({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
}: ProblemDefinitionProps) {
  return (
    <Container>
      <Button>Define test problem</Button>
    </Container>
  );
}

export default ProblemDefinition;
