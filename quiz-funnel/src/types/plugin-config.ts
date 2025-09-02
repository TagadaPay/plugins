export type QuizOption = {
  id: string;
  label: string;
  image: string;
};

export type QuizQuestion = {
  title: string;
  subtitle: string;
  options: QuizOption[];
  label: string;
};

export type PluginConfig = {
  configName: string;
  title: string;
  primaryColor: string;
  primaryForeground: string;
  loading: {
    title: string;
    subtitles: string[];
  };
  results: {
    title: string;
    subtitle: string;
    answersTitle: string;
  };
  home: {
    title: string;
    accentuatedTitle: string;
    subtitle: string;
    badge: string;
    cards: {
      personalizedAnalysis: string;
      expertFormulated: string;
      provenResults: string;
    };
  };
  thankYou: {
    title: string;
    subtitle: string;
    steps: {
      title: string;
      subtitle: string;
    }[];
  };
  variants: string[];
  googleApiKey: string;
  defaultCurrency: string;
  quizzQuestions: QuizQuestion[];
  supportEmail: string;
};
