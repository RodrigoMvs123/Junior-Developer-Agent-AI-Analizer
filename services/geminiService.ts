import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the API client
// Note: In a real production app, this key should be proxy-served. 
// For this frontend-only demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeBugWithGemini = async (
  title: string, 
  description: string, 
  repoContext: string
): Promise<AnalysisResult> => {
  
  // If no API key is present, return a mock response to prevent app crash in preview mode
  if (!process.env.API_KEY) {
    console.warn("No API_KEY found. Returning mock analysis.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return {
      rootCause: "OAuth token validation logic in `auth/middleware.js` fails to handle expired refresh tokens correctly, causing a 401 loop.",
      proposedSolution: "Implement a token refresh interceptor in the API client and update the server-side validation to strictly check expiry before verification.",
      filesToModify: ["src/auth/middleware.js", "src/services/apiClient.ts"],
      confidence: 92,
      suggestedGitComment: "### Analysis Result\n\n**Root Cause:**\nThe OAuth token validation logic fails to gracefully handle expired refresh tokens, leading to an infinite 401 loop.\n\n**Proposed Solution:**\n1. Update `auth/middleware.js` to check for token expiry before validation.\n2. Implement a refresh interceptor in `services/apiClient.ts`.\n\n**Estimated Effort:** Medium"
    };
  }

  const prompt = `
    You are a Senior Bug-Fixing Developer AI. Analyze the following bug report.
    
    Repository: ${repoContext}
    Bug Title: ${title}
    Description: ${description}

    Provide a structured analysis in JSON format containing:
    1. rootCause: A concise technical explanation of why the bug is happening.
    2. proposedSolution: A high-level strategy to fix it.
    3. filesToModify: A list of likely file paths that need changes.
    4. confidence: A number between 0 and 100 representing your confidence level.
    5. suggestedGitComment: A comprehensive Markdown-formatted response ready to be pasted directly into a GitHub issue comment or PR description. It should summarize the root cause, detail the proposed solution step-by-step, and list the files to be changed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING },
            proposedSolution: { type: Type.STRING },
            filesToModify: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            confidence: { type: Type.INTEGER },
            suggestedGitComment: { type: Type.STRING }
          },
          required: ["rootCause", "proposedSolution", "filesToModify", "confidence", "suggestedGitComment"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");
    
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze bug with AI.");
  }
};