import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface QuizAnswers {
  skinTone: string;
  skinType: string;
  goals: string;
  frequency: string;
}

export interface QuizResults {
  skinTone: string;
  skinType: string;
  goals: string[];
  frequency: string;
}

export const useQuizAnswers = () => {
  const [answers, setAnswers] = useState<QuizAnswers>({
    skinTone: "",
    skinType: "",
    goals: "",
    frequency: "",
  });

  const navigate = useNavigate();

  const updateAnswer = (field: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return answers.skinTone !== "";
      case 2:
        return answers.skinType !== "";
      case 3:
        return answers.goals !== "";
      case 4:
        return answers.frequency !== "";
      default:
        return false;
    }
  };

  const submitQuiz = () => {
    const quizResults: QuizResults = {
      skinTone: answers.skinTone,
      skinType: answers.skinType,
      goals: [answers.goals], // Convert to array format expected by results page
      frequency: answers.frequency,
    };
    localStorage.setItem("quizResults", JSON.stringify(quizResults));
    navigate("/quiz/results");
  };

  const resetAnswers = () => {
    setAnswers({
      skinTone: "",
      skinType: "",
      goals: "",
      frequency: "",
    });
  };

  return {
    answers,
    updateAnswer,
    canProceed,
    submitQuiz,
    resetAnswers,
  };
};
