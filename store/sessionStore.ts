import { create } from "zustand";

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface Micros {
  [key: string]: string;
}

export interface Insights {
  pros: string[];
  cons: string[];
  best_time_to_eat: string;
  who_should_avoid: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  imageUri?: string;
  food_items: string[];
  calories: string | number;
  macros: Macros;
  micros: Micros;
  confidence: "low" | "medium" | "high";
  assumptions: string[];
  insights: Insights;
}

interface SessionState {
  analyses: AnalysisResult[];
  addAnalysis: (result: Omit<AnalysisResult, "id" | "timestamp">) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  analyses: [],

  addAnalysis: (result) =>
    set((state) => ({
      analyses: [
        ...state.analyses,
        {
          ...result,
          id: Math.random().toString(36).slice(2),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  clearSession: () => set({ analyses: [] }),
}));
