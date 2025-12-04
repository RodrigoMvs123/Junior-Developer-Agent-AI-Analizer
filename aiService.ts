import { AnalysisResult } from "./types";

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'amazon/nova-2-lite-v1:free';

export const analyzeBugWithAI = async (
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
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Junior Bug Fixing Agent'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let resultText = data.choices[0].message.content;

    if (!resultText) throw new Error("Empty response from AI");

    // Remove markdown code blocks if present (```json ... ```)
    resultText = resultText.trim();
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Parse the JSON response
    const parsed = JSON.parse(resultText) as AnalysisResult;
    return parsed;

  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    
    // Provide more specific error messages
    if (error.message?.includes('rate limit')) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    } else if (error.message?.includes('invalid') || error.message?.includes('unauthorized')) {
      throw new Error("Invalid API key. Please check your VITE_API_KEY in .env file");
    }
    
    throw new Error(`Failed to analyze bug with AI: ${error.message || 'Unknown error'}`);
  }
};