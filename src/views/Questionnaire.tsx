import React from "react";
import { useEffect, useState } from "react";
import { Tokens } from "../types/AppTypes";

interface Question {
  type: "likert" | "open" | "differential";
  name: string;
  questionTxt: string;
  answer: string | number;
}

interface QuestionnaireProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
}

function Questionnaire({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
}: QuestionnaireProps) {
  const [questions, SetQuestions] = useState();

  // fetch questions
  return <div> This is the questionnaire</div>;
}

export default Questionnaire;
