export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  image?: string;
}

export const skinTones: QuizOption[] = [
  { id: "fair", label: "Fair", image: "/fair-skinned-woman-portrait.png" },
  { id: "light", label: "Light", image: "/light-skin-woman-portrait.png" },
  { id: "medium", label: "Medium", image: "/medium-skin-woman-portrait.png" },
  {
    id: "medium-dark",
    label: "Medium-Dark",
    image: "/medium-dark-woman-portrait.png",
  },
  { id: "dark", label: "Dark", image: "/dark-skin-woman-portrait.png" },
  { id: "deep", label: "Deep", image: "/deep-skin-tone-woman-portrait.png" },
];

export const skinTypes: QuizOption[] = [
  {
    id: "normal",
    label: "Normal",
    description: "Balanced, not too oily or dry",
  },
  { id: "dry", label: "Dry", description: "Feels tight, flaky, or rough" },
  {
    id: "oily",
    label: "Oily",
    description: "Shiny, enlarged pores, prone to breakouts",
  },
  {
    id: "combination",
    label: "Combination",
    description: "Oily T-zone, dry cheeks",
  },
  {
    id: "sensitive",
    label: "Sensitive",
    description: "Easily irritated, reactive to products",
  },
];

export const skinGoals: QuizOption[] = [
  {
    id: "hydration",
    label: "Hydration & Moisture",
    description: "Combat dryness and maintain skin barrier",
  },
  {
    id: "anti-aging",
    label: "Anti-Aging",
    description: "Reduce fine lines and improve firmness",
  },
  {
    id: "acne",
    label: "Acne Control",
    description: "Clear breakouts and prevent future blemishes",
  },
  {
    id: "brightening",
    label: "Brightening",
    description: "Even skin tone and reduce dark spots",
  },
  {
    id: "maintenance",
    label: "General Maintenance",
    description: "Keep healthy skin looking its best",
  },
];

export const frequencies: QuizOption[] = [
  {
    id: "beginner",
    label: "New to skincare",
    description: "Just starting my skincare journey",
  },
  {
    id: "basic",
    label: "Basic routine",
    description: "Cleanser and moisturizer only",
  },
  {
    id: "moderate",
    label: "Moderate routine",
    description: "3-5 products, morning and evening",
  },
  {
    id: "advanced",
    label: "Advanced routine",
    description: "6+ products with targeted treatments",
  },
];
