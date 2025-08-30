import { AnswerButton } from "@/components/AnswerButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { frequencies, skinGoals, skinTones, skinTypes } from "@/data/quizData";
import { useQuizAnswers } from "@/hooks/useQuizAnswers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { answers, updateAnswer, canProceed, submitQuiz } = useQuizAnswers();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center p-4">
      <div className="w-full flex flex-col max-w-4xl flex-grow self-stretch">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            Step {currentStep} - Quiz
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Skincare Tagada white label
          </h1>
          <Progress value={progress} className="w-full max-w-md mx-auto mb-4" />
          <div className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-xl bg-white flex-grow">
          <CardContent className="flex-grow flex flex-col">
            {/* Step 1: Skin Tone */}
            {currentStep === 1 && (
              <div className="text-center flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Select the model that matches your skin tone
                </h2>
                <p className="text-muted-foreground mb-8">
                  So we can better color match you
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {skinTones.map((tone) => (
                    <AnswerButton
                      key={tone.id}
                      id={tone.id}
                      label={tone.label}
                      image={tone.image}
                      isSelected={answers.skinTone === tone.id}
                      onClick={() => updateAnswer("skinTone", tone.id)}
                      variant="image"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Skin Type */}
            {currentStep === 2 && (
              <div className="text-center flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  What's your skin type?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Help us understand your skin's needs
                </p>

                <div className="grid gap-4 max-w-2xl mx-auto">
                  {skinTypes.map((type) => (
                    <AnswerButton
                      key={type.id}
                      id={type.id}
                      label={type.label}
                      description={type.description}
                      isSelected={answers.skinType === type.id}
                      onClick={() => updateAnswer("skinType", type.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="text-center flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  What are your main skincare goals?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Choose your primary concern
                </p>

                <div className="grid gap-4 max-w-2xl mx-auto">
                  {skinGoals.map((goal) => (
                    <AnswerButton
                      key={goal.id}
                      id={goal.id}
                      label={goal.label}
                      description={goal.description}
                      isSelected={answers.goals === goal.id}
                      onClick={() => updateAnswer("goals", goal.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Frequency */}
            {currentStep === 4 && (
              <div className="text-center flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  How often do you use skincare products?
                </h2>
                <p className="text-muted-foreground mb-8">
                  This helps us recommend the right routine complexity
                </p>

                <div className="grid gap-4 max-w-2xl mx-auto">
                  {frequencies.map((freq) => (
                    <AnswerButton
                      key={freq.id}
                      id={freq.id}
                      label={freq.label}
                      description={freq.description}
                      isSelected={answers.frequency === freq.id}
                      onClick={() => updateAnswer("frequency", freq.id)}
                    />
                  ))}
                </div>
              </div>
            )}

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
