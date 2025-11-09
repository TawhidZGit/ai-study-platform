// Loads environment variables from a .env file
require('dotenv').config();

// Quiz schema - what the frontend expects
const quizSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { 
            type: "STRING",
            description: "The quiz question" 
          },
          options: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Exactly 4 multiple choice options (A, B, C, D)"
          },
          correctAnswer: { 
            type: "INTEGER",
            description: "Index of correct option (0=A, 1=B, 2=C, 3=D)"
          },
          explanation: { 
            type: "STRING",
            description: "Detailed explanation of why the answer is correct"
          }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["questions"]
};

function createQuizPrompt(documentContent, numQuestions) {
  return `
    Based on the following document, create exactly ${numQuestions} multiple choice questions to test comprehension.
    
    Requirements:
    - Each question should have exactly 4 options (label them A, B, C, D)
    - Mix difficulty levels (easy, medium, hard)
    - Cover different topics from the document
    - Include clear explanations for correct answers
    - correctAnswer should be 0 for A, 1 for B, 2 for C, 3 for D
    
    Document Content:
    ---
    ${documentContent}
    ---
    
    Respond ONLY with the JSON object.
  `;
}

async function callGeminiForQuiz(documentContent, numQuestions, modelName) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = createQuizPrompt(documentContent, numQuestions);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
      temperature: 0.7, // Higher temp for more varied questions
    }
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`API Error Body (model: ${modelName}):`, errorBody);
        throw new Error(`API call failed with status: ${response.status}. ${errorBody.error?.message || ''}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (!candidate || !candidate.content?.parts?.[0]?.text) {
        console.error(`Gemini API Error: Model ${modelName} did not return valid content.`, result);
        throw new Error("Model did not return valid content.");
      }

      const jsonResponseText = candidate.content.parts[0].text;
      return JSON.parse(jsonResponseText);

    } catch (error) {
      console.error(`Gemini API call failed (model: ${modelName}, attempt ${4 - retries}):`, error.message);
      retries--;
      if (retries === 0) {
        throw new Error(`Model ${modelName} failed after 3 attempts.`);
      }
      await new Promise(res => setTimeout(res, 1000 * (3 - retries)));
    }
  }
}

async function generateQuiz(documentContent, numQuestions = 10) {
  // Limit content to prevent token overflow
  const truncatedContent = documentContent.substring(0, 30000);
  
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting quiz generation with model: ${modelName}`);
      const quiz = await callGeminiForQuiz(truncatedContent, numQuestions, modelName);
      return quiz;
    } catch (error) {
      console.error(`Model ${modelName} failed: ${error.message}`);
    }
  }

  console.error("AI Quiz Error: All models failed.");
  throw new Error("Failed to generate quiz after trying all available models.");
}

module.exports = {
  generateQuiz
};