require('dotenv').config();

const flashcardSchema = {
  type: "OBJECT",
  properties: {
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          front: { 
            type: "STRING",
            description: "Key concept, term, or question (concise)" 
          },
          back: { 
            type: "STRING",
            description: "Definition, explanation, or answer (comprehensive but clear)" 
          }
        },
        required: ["front", "back"]
      }
    }
  },
  required: ["cards"]
};

function createFlashcardPrompt(documentContent, numCards) {
  return `
    Based on the following document, create exactly ${numCards} flashcards for effective studying.
    
    Requirements:
    - Front: Key concept, term, or question (keep it concise)
    - Back: Definition, explanation, or answer (comprehensive but clear)
    - Cover the most important information
    - Mix different types: definitions, concepts, relationships, applications
    - Make them useful for active recall practice
    
    Document Content:
    ---
    ${documentContent}
    ---
    
    Respond ONLY with the JSON object.
  `;
}

async function callGeminiForFlashcards(documentContent, numCards, modelName) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = createFlashcardPrompt(documentContent, numCards);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: flashcardSchema,
      temperature: 0.6, // Balanced creativity
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

async function generateFlashcards(documentContent, numCards = 20) {
  const truncatedContent = documentContent.substring(0, 30000);
  
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting flashcard generation with model: ${modelName}`);
      const flashcards = await callGeminiForFlashcards(truncatedContent, numCards, modelName);
      return flashcards;
    } catch (error) {
      console.error(`Model ${modelName} failed: ${error.message}`);
    }
  }

  console.error("AI Flashcard Error: All models failed.");
  throw new Error("Failed to generate flashcards after trying all available models.");
}

module.exports = {
  generateFlashcards
};