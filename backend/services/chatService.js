require('dotenv').config();

// Mode-specific system prompts
const MODE_PROMPTS = {
  study: `You are a helpful study tutor. Your goal is to help the student learn and understand the material deeply. 
- Ask clarifying questions to check understanding
- Encourage active recall
- Provide clear explanations with examples
- Be encouraging and supportive
- Reference specific sources when answering`,

  quiz: `You are a quiz master. Your goal is to test the student's knowledge.
- Ask challenging questions based on the sources
- Provide immediate feedback on answers
- Explain why answers are correct or incorrect
- Track which topics need more work
- Be encouraging but challenging`,

  explain: `You are an expert educator who explains complex topics simply.
- Break down complex concepts into simple terms
- Use analogies and real-world examples
- Avoid jargon unless necessary
- Check for understanding
- Build explanations step-by-step`,

  summarize: `You are a summarization expert.
- Provide concise overviews of key information
- Highlight the most important points
- Organize information logically
- Use bullet points when helpful
- Focus on main ideas over details`
};

async function generateResponse({ userMessage, sources, chatHistory, mode = 'study' }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Build context from sources
  let sourcesContext = '';
  if (sources && sources.length > 0) {
    sourcesContext = '\n\nAvailable Sources:\n';
    sources.forEach((source, index) => {
      // Limit content to first 3000 characters per source to avoid token limits
      const truncatedContent = source.content.substring(0, 3000);
      sourcesContext += `\nSource ${index + 1} (${source.filename}):\n${truncatedContent}\n`;
    });
  } else {
    sourcesContext = '\n\nNo sources have been uploaded yet. Let the user know they should upload sources first.';
  }

  // Build chat history context
  let historyContext = '';
  if (chatHistory && chatHistory.length > 0) {
    historyContext = '\n\nRecent Conversation:\n';
    chatHistory.forEach(msg => {
      historyContext += `${msg.role === 'user' ? 'Student' : 'You'}: ${msg.content}\n`;
    });
  }

  // Build the full prompt
  const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.study;
  
  const fullPrompt = `${systemPrompt}

${sourcesContext}

${historyContext}

Student's Question: ${userMessage}

Provide a helpful response based on the sources and conversation context. Keep responses concise but thorough.`;

  // Call Gemini API
  const modelName = 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorBody);
      throw new Error(`API call failed: ${response.status}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];

    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiContent = candidate.content.parts[0].text;

    // Determine which sources were likely used (simple heuristic)
    const sourcesUsed = sources
      .filter(source => aiContent.toLowerCase().includes(source.filename.toLowerCase()))
      .map(source => source.id);

    return {
      content: aiContent,
      sourcesUsed: sourcesUsed.length > 0 ? sourcesUsed : null
    };

  } catch (error) {
    console.error('Chat AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

module.exports = {
  generateResponse
};