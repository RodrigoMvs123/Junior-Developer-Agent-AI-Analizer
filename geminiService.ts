import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "./types";

// Initialize the API client
// Note: In a real production app, this key should be proxy-served. 
// For this frontend-only demo, we assume the environment variable is injected.
const getGenAI = () => new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || '');

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeBugWithGemini = async (
  title: string,
  description: string,
  repoContext: string
): Promise<AnalysisResult> => {

  if (!import.meta.env.VITE_API_KEY) {
    throw new Error("API key is required. Please add VITE_API_KEY to your .env file.");
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
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const resultText = response.text();

    if (!resultText) throw new Error("Empty response from Gemini");

    // Try to parse the JSON response
    const parsed = JSON.parse(resultText) as AnalysisResult;
    return parsed;

  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key expired')) {
      throw new Error("API key has expired. Please generate a new key at https://aistudio.google.com/app/apikey");
    } else if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API key. Please check your VITE_API_KEY in .env file");
    } else if (error.message?.includes('quota')) {
      throw new Error("API quota exceeded. Please wait or upgrade your plan.");
    }
    
    throw new Error(`Failed to analyze bug with AI: ${error.message || 'Unknown error'}`);
  }
};