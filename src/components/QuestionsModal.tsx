import { useState, useEffect } from "react";
import { Tokens } from "../types/AppTypes";

type QuestionnaireType = "After" | "During";

interface QuestionsModalProps {
  tokens: Tokens;
  apiUrl: string;
  questionnaireType: QuestionnaireType;
  description: string;
}

interface Question {
  type: string;
  name: string;
  question_txt: string;
  answer: string;
}

function QuestionsModal({
  tokens,
  apiUrl,
  questionnaireType,
  description,
}: QuestionsModalProps) {
  const [questionnaire, SetQuestionnaire] = useState<Question[]>([]);

  useEffect(() => {
    if (questionnaire.length > 0) {
      // questionnaire already fetched, do nothing
      return;
    }

    // fetch questionnaire depending on questionnaireType
    const fetchQuestionnaire = async () => {
      console.log("fetching quesitons...");
      const endPoint = questionnaireType === "After" ? "after" : "during";

      const res = await fetch(`${apiUrl}/questionnaire/${endPoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });

      if (res.status == 200) {
        const body = await res.json();
        // TODO: set the questionnaire
        const questions = body.questions;
        SetQuestionnaire(questions);
      }
    };

    fetchQuestionnaire();
  });
  return <>{`${questionnaire}`}</>;
}

export default QuestionsModal;
