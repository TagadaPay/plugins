import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface QuizAnswers {
  [key: string]: string;
}

export interface QuizResults {
  [key: string]: string | string[];
}

export const useQuizAnswers = () => {
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const navigate = useNavigate();

  const updateAnswer = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (currentStep: number): boolean => {
    const answerKey = `question${currentStep}`;
    return answers[answerKey] !== undefined && answers[answerKey] !== "";
  };

  const submitQuiz = () => {
    const quizResults: QuizResults = {
      ...answers,
    };
    localStorage.setItem("quizResults", JSON.stringify(quizResults));
    navigate("/quiz/results");
  };

  const resetAnswers = () => {
    setAnswers({});
  };

  return {
    answers,
    updateAnswer,
    canProceed,
    submitQuiz,
    resetAnswers,
  };
};
