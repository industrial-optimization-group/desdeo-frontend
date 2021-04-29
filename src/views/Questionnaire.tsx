import React from "react";
import { useEffect, useState } from "react";
import { Tokens } from "../types/AppTypes";
import { useForm, Controller } from "react-hook-form";
import {
  ButtonGroup,
  Form,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";

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
  const [answers, SetAnswers] = useState<FormData>({ values: [] });

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
          console.log("Questions fetched successfully!");
        } else {
          console.log(
            `Got return code ${res.status}. Could not fetch resource.`
          );
          // do nothing
        }
      } catch (e) {
        console.log("not ok");
        console.log(e);
        // do nothing
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!fetched) {
      // do nothing
      return;
    } else {
      SetAnswers({
        values: questions.map((q, i) => {
          if (q.type === "likert") {
            return "4";
          }
          if (q.type === "differential") {
            return "4";
          }
          if (q.type === "open") {
            return "No answer";
          } else {
            return "None";
          }
        }),
      });
    }
  }, [fetched]);

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  // fetch questions
  return (
    <Container>
      {fetched && (
        <Form action="" onSubmit={handleSubmit(onSubmit)}>
          {questions.map((q, i) => {
            if (q.type === "likert") {
              return (
                <Controller
                  as={
                    <Form.Group>
                      <Row>
                        <Col>
                          <Form.Label>{`${q.question_txt}`}</Form.Label>
                        </Col>
                      </Row>
                      <ButtonGroup>
                        <Button variant="secondary" value="1">
                          1
                        </Button>
                        <Button variant="secondary" value="2">
                          2
                        </Button>
                        <Button variant="secondary" value="3">
                          3
                        </Button>
                        <Button variant="secondary" active value="4">
                          4
                        </Button>
                        <Button variant="secondary" value="5">
                          5
                        </Button>
                        <Button variant="secondary" value="6">
                          6
                        </Button>
                        <Button variant="secondary" value="7">
                          7
                        </Button>
                      </ButtonGroup>
                    </Form.Group>
                  }
                  name={`values.${i}`}
                  control={control}
                  defaultValue="4"
                  // ref={register()}
                />
              );
            } else if (q.type === "differential") {
              return (
                <Controller
                  as={
                    <Form.Group>
                      <Row>
                        <Col>
                          <Form.Label>{`${q.question_txt}`}</Form.Label>
                        </Col>
                      </Row>
                      <ButtonGroup>
                        <Button variant="secondary" value="1">
                          1
                        </Button>
                        <Button variant="secondary" value="2">
                          2
                        </Button>
                        <Button variant="secondary" value="3">
                          3
                        </Button>
                        <Button variant="secondary" active value="4">
                          4
                        </Button>
                        <Button variant="secondary" value="5">
                          5
                        </Button>
                        <Button variant="secondary" value="6">
                          6
                        </Button>
                        <Button variant="secondary" value="7">
                          7
                        </Button>
                      </ButtonGroup>
                    </Form.Group>
                  }
                  name={`values.${i}`}
                  control={control}
                  defaultValue="4"
                  // ref={register()}
                />
              );
            } else {
              return (
                <Controller
                  as={
                    <Form.Group>
                      <Row>
                        <Col>
                          <Form.Label>{`${q.question_txt}`}</Form.Label>
                        </Col>
                      </Row>
                      <p>Text input placeholder</p>
                    </Form.Group>
                  }
                  name={`values.${i}`}
                  control={control}
                  defaultValue="4"
                  // ref={register()}
                />
              );
            }
          })}
          <Button type="submit">Submit</Button>
        </Form>
      )}
    </Container>
  );
}

export default Questionnaire;
