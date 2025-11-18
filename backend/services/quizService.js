require('dotenv').config();

const quizSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { 
            type: "ARRAY",
            items: { type: "STRING" }
          },
          correctAnswer: { type: "INTEGER" },
          explanation: { type: "STRING" }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["questions"]
};

async function generateQuiz(documentContent, numQuestions = 10) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const truncatedContent = documentContent.substring(0, 30000);
  
  const prompt = `Based on the following document, create exactly ${numQuestions} multiple choice questions to test comprehension.

Document content:
${truncatedContent}

Ensure each question has 4 distinct options (A, B, C, D) and an explanation for the correct choice.`;

  const modelName = 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate quiz');
  }

  const result = await response.json();
  const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!jsonText) {
    throw new Error('Invalid response from API');
  }

  return JSON.parse(jsonText);
}

module.exports = {
  generateQuiz
};