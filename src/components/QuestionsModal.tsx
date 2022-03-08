import { useState, useEffect } from "react";
import { Tokens } from "../types/AppTypes";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

type QuestionnaireType = "After" | "During";

interface QuestionsModalProps {
  tokens: Tokens;
  apiUrl: string;
  questionnaireType: QuestionnaireType;
  description: string;
}

interface Question {
  type: "likert" | "open" | "differential";
  name: string;
  question_txt: string;
  answer: string | number;
}

interface FormData {
  answers: string[];
}

function QuestionsModal({
  tokens,
  apiUrl,
  questionnaireType,
  description,
}: QuestionsModalProps) {
  // States related to the questionnaire
  const [questionnaire, SetQuestionnaire] = useState<Question[]>([]);
  const [questionnaireFetched, SetQuestionnaireFetched] =
    useState<boolean>(false);

  // Form states for collecting answers
  const { control, handleSubmit, errors } = useForm<FormData>({
    mode: "onSubmit",
  });
  const likertScale = new Map<number, string>([
    [0, "Strongly disagree"],
    [1, "Disagree"],
    [2, "Somewhat disagree"],
    [3, "Neither agree or disagree"],
    [4, "Somewhat agree"],
    [5, "Agree"],
    [6, "Strongly agree"],
  ]);
  const semanticDiff = new Map<number, string>([
    [0, "Very low"],
    [1, "Low"],
    [2, "Medium"],
    [3, "High"],
    [4, "Very high"],
  ]);

  useEffect(() => {
    if (questionnaireFetched) {
      // questionnaire already fetched, do nothing
      return;
    }

    // fetch questionnaire depending on questionnaireType
    const fetchQuestionnaire = async () => {
      console.log("fetching quesitons...");
      const endPoint = questionnaireType === "After" ? "after" : "during";

      try {
        const res = await fetch(`${apiUrl}/questionnaire/${endPoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (res.status == 200) {
          const body = await res.json();
          const questions = body.questions;
          SetQuestionnaire(questions);
          SetQuestionnaireFetched(true);
        } else {
          console.log(
            `Got status code ${res.status} while trying to fetch the questionnaire.`
          );
          // do nothing
          return;
        }
      } catch (e) {
        console.log(
          `Encountered an error while trying to fetch the questionnaire: ${e}`
        );
        // do nothing
        return;
      }
    };

    fetchQuestionnaire();
  }, []);

  function onSubmit(data: FormData) {
    console.log(data);
    return;
  }

  return (
    <Container>
      {questionnaireFetched && (
        <Row>
          <Col sm={12}>
            <Form action="" onSubmit={handleSubmit(onSubmit)}>
              {questionnaire.map((q, i) => {
                if (q.type === "likert") {
                  // return likert scale question
                  return (
                    <Row className={"mb-4"}>
                      <Col sm={12}>
                        <Controller
                          as={
                            <Form.Group>
                              <Row>
                                <Col sm={12}>
                                  <Form.Label>
                                    <h4>{`${q.question_txt}`}</h4>
                                  </Form.Label>
                                </Col>
                              </Row>
                              {[...Array(7)].map((_, j) => {
                                return (
                                  <Form.Check
                                    inline
                                    defaultChecked={j === 3 ? true : false}
                                    label={likertScale.get(j)}
                                    key={`keyofcheck${i}${j}`}
                                    name={`group${i}`}
                                    type={"radio"}
                                    value={j}
                                  />
                                );
                              })}
                            </Form.Group>
                          }
                          name={`answers.${i}`}
                          key={`keyofq${i}`}
                          control={control}
                          defaultValue={"3"}
                        ></Controller>
                      </Col>
                    </Row>
                  );
                } else if (q.type === "differential") {
                  // rerturn differential scale quesiton
                  return (
                    <Row className={"mb-4"}>
                      <Col sm={12}>
                        <Controller
                          as={
                            <Form.Group>
                              <Row>
                                <Col sm={12}>
                                  <Form.Label>
                                    <h4>{`${q.question_txt}`}</h4>
                                  </Form.Label>
                                </Col>
                              </Row>
                              {[...Array(5)].map((_, j) => {
                                return (
                                  <Form.Check
                                    inline
                                    defaultChecked={j === 2 ? true : false}
                                    label={semanticDiff.get(j)}
                                    key={`keyofcheck${i}${j}`}
                                    name={`group${i}`}
                                    type={"radio"}
                                    value={j}
                                  />
                                );
                              })}
                            </Form.Group>
                          }
                          name={`answers.${i}`}
                          key={`keyofq${i}`}
                          control={control}
                          defaultValue={"2"}
                        ></Controller>
                      </Col>
                    </Row>
                  );
                } else if (q.type === "open") {
                  // return open type question
                  return (
                    <Row className={"mb-4"}>
                      <Col sm={12}>
                        <Controller
                          as={
                            <Form.Group>
                              <Row>
                                <Col sm={12}>
                                  <Form.Label>
                                    <h4>{`${q.question_txt}`}</h4>
                                  </Form.Label>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={3} />
                                <Col>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    key={`keyoftextarea${i}`}
                                    placeholder={"Write your answer here"}
                                  />
                                </Col>
                                <Col sm={3} />
                              </Row>
                            </Form.Group>
                          }
                          name={`answers.${i}`}
                          key={`keyofq${i}`}
                          control={control}
                          defaultValue={"No answer"}
                        ></Controller>
                      </Col>
                    </Row>
                  );
                } else {
                  return <p>{"unkown type of question"}</p>;
                }
              })}
              <Button type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default QuestionsModal;
