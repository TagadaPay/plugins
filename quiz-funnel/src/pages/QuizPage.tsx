import { AnswerButton } from "@/components/AnswerButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizAnswers } from "@/hooks/useQuizAnswers";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function QuizPage() {
  const { config } = usePluginConfig<PluginConfig>();
  const quizQuestions = config?.quizzQuestions || [];
  const [currentStep, setCurrentStep] = useState(1);
  const { answers, updateAnswer, canProceed, submitQuiz } = useQuizAnswers();

  const totalSteps = quizQuestions.length;
  const progress = (totalSteps > 0 ? currentStep / totalSteps : 0) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentQuestion = () => {
    return quizQuestions[currentStep - 1];
  };

  const getAnswerKey = (step: number): string => {
    // Use the question index as the answer key for dynamic flexibility
    return `question${step}`;
  };

  const renderQuestionOptions = (question: any, answerKey: string) => {
    const hasImages = question.options.some((option: any) => option.image);

    return (
      <div
        className={`grid ${
          hasImages ? "grid-cols-2 md:grid-cols-3" : ""
        } gap-4 max-w-2xl mx-auto`}
      >
        {question.options.map((option: any) => (
          <AnswerButton
            key={option.id}
            id={option.id}
            label={option.label}
            description={option.description}
            image={option.image}
            isSelected={answers[answerKey] === option.id}
            onClick={() => updateAnswer(answerKey, option.id)}
            variant={hasImages ? "image" : "default"}
          />
        ))}
      </div>
    );
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            No quiz questions configured
          </h1>
          <p className="text-muted-foreground">
            Please check your configuration file.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswerKey = getAnswerKey(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center p-4">
      <div className="w-full flex flex-col max-w-4xl flex-grow self-stretch">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            Step {currentStep} - Quiz
          </div>
          <h1 className="text-3xl font-bold mb-4">{config.title}</h1>
          <Progress value={progress} className="w-full max-w-md mx-auto mb-4" />
          <div className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-xl bg-white flex-grow">
          <CardContent className="flex-grow flex flex-col">
            {/* Dynamic Question Content */}
            <div className="text-center flex-grow">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {currentQuestion.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {currentQuestion.subtitle}
              </p>

              {renderQuestionOptions(currentQuestion, currentAnswerKey)}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed(currentStep)}
                className="flex items-center gap-2 px-8"
              >
                {currentStep === totalSteps ? "Get Results" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
