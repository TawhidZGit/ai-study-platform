const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({});

const MODEL_FALLBACK_ORDER = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
];

async function generateWithFallback(prompt, config, modelIndex = 0) {
    if (modelIndex >= MODEL_FALLBACK_ORDER.length) {
        throw new Error('All models exhausted. Rate limits reached on all available models.');
    }

    const modelName = MODEL_FALLBACK_ORDER[modelIndex];
    console.log(`Attempting generation with model: ${modelName}`);

    try {
        const result = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: config,
        });

        if (result.json) {
            return result.json;
        }

        throw new Error('Model did not return a structured JSON response.');

    } catch (error) {
        console.error(`Model ${modelName} failed:`, error.message);

        if (error.message.includes('429') || error.message.includes('quota')) {
            console.log(`Rate limit hit on ${modelName}, trying next model...`);
            return generateWithFallback(prompt, config, modelIndex + 1);
        }

        throw error;
    }
}

const schemas = {
    summary: {
        type: Type.OBJECT,
        properties: {
            tldr: { type: Type.STRING, description: "A 2-3 sentence maximum summary." },
            keyPoints: { 
                type: Type.ARRAY, 
                description: "5 to 8 bullet points of main ideas.", 
                items: { type: Type.STRING },
                minItems: 5,
                maxItems: 8
            },
            detailedNotes: { type: Type.STRING, description: "Comprehensive notes organized by topic/section." },
            simpleExplanation: { type: Type.STRING, description: "An ELI5 explanation of the most complex concept." }
        },
        required: ['tldr', 'keyPoints', 'detailedNotes', 'simpleExplanation']
    },
    quiz: {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            minItems: 4,
                            maxItems: 4,
                            description: "Exactly 4 multiple choice options (A, B, C, D)." 
                        },
                        correctAnswer: { 
                            type: Type.INTEGER,
                            minimum: 0,
                            maximum: 3,
                            description: "The index of the correct option (0 for A, 1 for B, 2 for C, 3 for D)." 
                        },
                        explanation: { type: Type.STRING, description: "A detailed explanation for the correct answer." }
                    },
                    required: ['question', 'options', 'correctAnswer', 'explanation']
                }
            }
        },
        required: ['questions']
    },
    flashcards: {
        type: Type.OBJECT,
        properties: {
            cards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        front: { type: Type.STRING, description: "Key concept, term, or question (concise)." },
                        back: { type: Type.STRING, description: "Definition, explanation, or answer (comprehensive but clear)." }
                    },
                    required: ['front', 'back']
                }
            }
        },
        required: ['cards']
    }
};

const aiService = {
    async generateSummary(documentContent) {
        if (documentContent.length > 30000) {
            console.warn(`Document truncated from ${documentContent.length} to 30000 chars`);
        }

        const prompt = `You are an expert study assistant. Based on the following document, create comprehensive study notes that are well-organized and insightful.
        
Document content:
${documentContent.substring(0, 30000)}`;

        const config = {
            responseMimeType: 'application/json',
            responseSchema: schemas.summary,
            temperature: 0.3, // Factual and deterministic
        };

        try {
            return await generateWithFallback(prompt, config);
        } catch (error) {
            console.error('AI Summary Error:', error);
            throw new Error('Failed to generate summary after trying all available models.');
        }
    },

    async generateQuiz(documentContent, numQuestions = 10) {
        if (documentContent.length > 30000) {
            console.warn(`Document truncated from ${documentContent.length} to 30000 chars`);
        }

        const prompt = `Based on the following document, create exactly ${numQuestions} multiple choice questions to test comprehension and application.
        
Document content:
${documentContent.substring(0, 30000)}

Ensure each question has 4 distinct options (A, B, C, D) and an explanation for the correct choice.`;

        const config = {
            responseMimeType: 'application/json',
            responseSchema: schemas.quiz,
            temperature: 0.7, // Varied questions
        };

        try {
            return await generateWithFallback(prompt, config);
        } catch (error) {
            console.error('AI Quiz Error:', error);
            throw new Error('Failed to generate quiz after trying all available models.');
        }
    },

    async generateFlashcards(documentContent, numCards = 20) {
        if (documentContent.length > 30000) {
            console.warn(`Document truncated from ${documentContent.length} to 30000 chars`);
        }

        const prompt = `Based on the following document, create exactly ${numCards} flashcards for effective studying.
        
Document content:
${documentContent.substring(0, 30000)}

Ensure the front is a key concept or term and the back is a clear definition/explanation.`;

        const config = {
            responseMimeType: 'application/json',
            responseSchema: schemas.flashcards,
            temperature: 0.5, // Balanced
        };

        try {
            return await generateWithFallback(prompt, config);
        } catch (error) {
            console.error('AI Flashcard Error:', error);
            throw new Error('Failed to generate flashcards after trying all available models.');
        }
    }
};

module.exports = aiService;