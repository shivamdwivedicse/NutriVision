import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionAnalysis } from "../types";

// Safe access to environment variable to prevent ReferenceError in browsers
const getApiKey = (): string | undefined => {
  try {
    // In Vite, this string is replaced at build time with the actual key.
    // We access it directly to ensure the replacement works.
    return process.env.API_KEY;
  } catch (e) {
    // Fallback if replacement didn't happen and process is undefined
    return undefined;
  }
};

// Define the schema for the nutrition analysis to ensure consistent JSON output
const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "Name of the identified food" },
    portionSize: { type: Type.STRING, description: "Estimated portion size (e.g., '1 medium bowl')" },
    assumptions: { type: Type.STRING, description: "Assumptions made about the food (e.g., 'Assumed cooked with olive oil')" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          calories: { type: Type.NUMBER },
        },
        required: ["name", "quantity", "calories"],
      },
    },
    totalCalories: { type: Type.NUMBER, description: "Sum of all ingredient calories" },
    simpleExplanation: { type: Type.STRING, description: "A simple, non-technical explanation of the calorie source" },
    disclaimer: { type: Type.STRING, description: "Standard medical disclaimer" },
    healthyTips: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Short tips on how to make this healthier or what nutrients it provides" 
    }
  },
  required: ["foodName", "portionSize", "assumptions", "ingredients", "totalCalories", "simpleExplanation", "disclaimer"],
};

export const analyzeImageConfig = {
  model: 'gemini-3-flash-preview', 
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: nutritionSchema,
    temperature: 0.4, // Keep it factual
  }
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<NutritionAnalysis> => {
  const apiKey = getApiKey();

  // Explicitly check for API Key before attempting call
  if (!apiKey || apiKey === 'dummy-key-for-types') {
    throw new Error("API Key is missing. Please set REACT_APP_API_KEY or process.env.API_KEY in your local environment.");
  }

  // Initialize AI client lazily to ensure we use the current key and avoid top-level crashes
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: analyzeImageConfig.model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `You are a professional AI Nutrition Analyst. Analyze the food in this image.
            
            Follow this process:
            1. Identify the food item(s).
            2. Estimate the portion size based on visual cues.
            3. Break down the food into logical ingredients (base, toppings, oils, sauces).
            4. Estimate calories for each ingredient using standard database averages.
            5. Sum the total calories.
            6. Provide a simple explanation suitable for a non-technical user.
            7. Add a medical disclaimer.
            
            Return the result strictly as a valid JSON object matching the provided schema. Do not include markdown code blocks.`
          }
        ]
      },
      config: analyzeImageConfig.generationConfig
    });

    let text = response.text;
    if (!text) throw new Error("The AI returned an empty response. Please try again.");
    
    // Cleanup: Remove markdown code blocks if the model included them (e.g. ```json ... ```)
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();

    try {
      return JSON.parse(text) as NutritionAnalysis;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse the nutrition data. Please try a different photo.");
    }

  } catch (error: any) {
    console.error("Error analyzing image:", error);
    
    // Provide more specific error messages to the UI
    let msg = error.message || "Unknown error";
    if (msg.includes("400")) msg = "Bad Request: The image might be unclear or format unsupported.";
    if (msg.includes("401") || msg.includes("API Key")) msg = "Authentication failed. Please check your API Key configuration.";
    if (msg.includes("503")) msg = "Service overloaded. Please try again in a moment.";
    if (msg.includes("SAFETY")) msg = "The image triggered a safety filter. Please try a different photo.";
    
    throw new Error(msg);
  }
};

export const sendFollowUpMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  currentContext: NutritionAnalysis
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Configuration Error: API Key is missing.";

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // We use a chat model for the conversation, providing the context of the analysis
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview", 
      config: {
        systemInstruction: `You are a helpful AI Nutritionist. 
        The user has just had a food image analyzed.
        
        Context of the food analyzed:
        Food: ${currentContext.foodName}
        Ingredients: ${JSON.stringify(currentContext.ingredients)}
        Total Calories: ${currentContext.totalCalories}
        
        Answer the user's follow-up questions politely, scientifically, and encouragingly.
        Do not be judgmental. Keep answers concise (under 3 sentences unless asked for detail).`
      },
      history: history 
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};
