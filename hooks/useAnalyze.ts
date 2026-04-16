import { useMutation } from "@tanstack/react-query";
import { AnalysisResult } from "../store/sessionStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8001";

interface AnalyzePayload {
  image: string; // base64
}

async function analyzeFood(
  payload: AnalyzePayload
): Promise<Omit<AnalysisResult, "id" | "timestamp">> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err: any) {
    throw new Error(`Cannot reach backend at ${API_URL} — is it running? (${err.message})`);
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.detail ?? `Server error ${res.status}`);
  }
  return json;
}

export function useAnalyze() {
  return useMutation({
    mutationFn: analyzeFood,
  });
}
