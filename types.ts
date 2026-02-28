export interface Ingredient {
  name: string;
  quantity: string;
  calories: number;
}

export interface NutritionAnalysis {
  foodName: string;
  portionSize: string;
  assumptions: string;
  ingredients: Ingredient[];
  totalCalories: number;
  simpleExplanation: string;
  disclaimer: string;
  healthyTips?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}