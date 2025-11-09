// Loads environment variables from a .env file
require('dotenv').config();

// This is the JSON "blueprint" the model MUST follow.
// It matches what your Summary.jsx component expects.
const summarySchema = {
  type: "OBJECT",
  properties: {
    tldr: { 
      type: "STRING",
      description: "A short, one-sentence summary (TL;DR)." 
    },
    keyPoints: {
      type: "ARRAY",
      items: { 
        type: "STRING",
        description: "A key point or takeaway from the document." 
      },
      description: "A list of 3-5 main key points."
    },
    detailedNotes: { 
      type: "STRING",
      description: "More detailed, in-depth notes from the document, formatted as a single string with newlines (\\n)." 
    },
    simpleExplanation: { 
      type: "STRING",
      description: "A simple, 'Explain Like I'm 5' (ELI5) version of the main topic." 
    }
  },
  // This ensures all fields are always returned
  required: ["tldr", "keyPoints", "detailedNotes", "simpleExplanation"]
};

// This is your prompt to the model.
function createSummaryPrompt(documentContent) {
  // We are no longer truncating. The full document content is passed.
  return `
    Please analyze the following document and generate a set of study notes in the required JSON format.
    
    Document Content:
    ---
    ${documentContent}
    ---
    
    Respond ONLY with the JSON object.
  `;
}

// Helper function to call the Gemini API
async function callGeminiForSummary(documentContent, modelName) {
  // We load the API key from your .env file
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found. Please set it in your .env file.");
    throw new Error("API key is missing.");
  }

  // --- THIS IS THE FIX ---
  // Corrected the typo in the API endpoint URL.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  // --- END OF FIX ---

  const prompt = createSummaryPrompt(documentContent);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // Force the model to return JSON
      responseMimeType: "application/json",
      responseSchema: summarySchema,
      temperature: 0.5, // Good for consistent summary results
    }
  };

  // --- API CALL AND PARSING ---
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Try to get more error details from the response body
        const errorBody = await response.json().catch(() => ({})); // Use .catch in case body isn't valid JSON
        console.error(`API Error Body (model: ${modelName}):`, errorBody);
        throw new Error(`API call failed with status: ${response.status}. ${errorBody.error?.message || ''}`);
      }

      const result = await response.json();
      
      const candidate = result.candidates?.[0];

      if (!candidate || !candidate.content?.parts?.[0]?.text) {
        // This catches partial or other non-safety-related blocked responses
        console.error(`Gemini API Error: Model ${modelName} did not return valid content.`, result);
        throw new Error("Model did not return valid content.");
      }

      // The 'text' field is now a guaranteed JSON string.
      // We just need to parse it.
      const jsonResponseText = candidate.content.parts[0].text;
      return JSON.parse(jsonResponseText); // This should now work!

    } catch (error) {
      console.error(`Gemini API call failed (model: ${modelName}, attempt ${4 - retries}):`, error.message);
      retries--;
      if (retries === 0) {
        throw new Error(`Model ${modelName} failed after 3 attempts.`);
      }
      // Exponential backoff wait
      await new Promise(res => setTimeout(res, 1000 * (3 - retries)));
    }
  }
}

// Main function to generate the summary
async function generateSummary(documentContent) {
  // --- UPDATED FALLBACK ORDER ---
  // Try 'pro' first for large docs, then 'flash' and 'flash-lite'
  const modelsToTry = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      
      const summary = await callGeminiForSummary(documentContent, modelName);
      
      // Success!
      return summary;

    } catch (error) {
      // Log the failure and try the next model
      console.error(`Model ${modelName} failed: ${error.message}`);
    }
  }

  // If all models failed
  console.error("AI Summary Error: All models failed.");
  throw new Error("Failed to generate summary after trying all available models.");
}

// Make sure to export your main function
module.exports = {
  generateSummary
};
