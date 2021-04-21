import React from "react";
import { useEffect, useState } from "react";
import { Tokens } from "../types/AppTypes";
import { useForm } from "react-hook-form";
import { ButtonGroup, Controller, FormControlLabel, Radio, RadioGroup, Form, Button, Container, Row, Col } from "react-bootstrap";

interface Question {
  type: "likert" | "open" | "differential";
  name: string;
  question_txt: string;
  answer: string | number;
}

interface QuestionnaireProps {
  isLoggedIn: boolean;
  loggedAs: string;
  tokens: Tokens;
  apiUrl: string;
}

interface FormData {
  values: string[];
}

function Questionnaire({
  isLoggedIn,
  loggedAs,
  tokens,
  apiUrl,
}: QuestionnaireProps) {
  const [questions, SetQuestions] = useState<Question[]>([]);
  const [fetched, SetFetched] = useState(false);
  const { register, handleSubmit, control } = useForm<FormData>();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${apiUrl}/questionnaire/after`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (res.status == 200) {
          const body = await res.json();
          // set questions
          SetQuestions(body.questions);
          SetFetched(true);
          console.log("Questions fetched successfully!")
        } else {
          console.log(
            `Got return code ${res.status}. Could not fetch resource.`
          )
          // do nothing
        }
      } catch (e) {
        console.log("not ok")
        console.log(e)
        // do nothing
      }
    };

    fetchQuestions();
  }, [])

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  // fetch questions
  return <Container>{fetched &&
    <Form action="" onSubmit={handleSubmit(onSubmit)}>
      {questions.map((q, i) => {
        return (
          <div key={`${i}`}>
            <Controller
              as={
                <RadioGroup aria-label="gender">
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Male"
                  />
                </RadioGroup>
              }
              name="RadioGroup"
              control={control}
            />
          </div>)

      })}
    </Form>
  }</Container>
}

export default Questionnaire;
