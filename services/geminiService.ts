import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionAnalysis } from "../types";

// Vite-friendly API key access
const getApiKey = (): string => {
  const key = import.meta.env.VITE_API_KEY;
  if (!key) {
    throw new Error("API Key is missing! Please set VITE_API_KEY in .env file");
  }
  return key;
};

// Schema for nutrition analysis
const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "Name of the identified food" },
    portionSize: { type: Type.STRING, description: "Estimated portion size" },
    assumptions: { type: Type.STRING, description: "Assumptions made about the food" },
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
    simpleExplanation: { type: Type.STRING, description: "Simple explanation of calories" },
    disclaimer: { type: Type.STRING, description: "Standard medical disclaimer" },
    healthyTips: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Health tips or nutrient info" 
    }
  },
  required: ["foodName","portionSize","assumptions","ingredients","totalCalories","simpleExplanation","disclaimer"],
};

// AI generation config
export const analyzeImageConfig = {
  model: 'gemini-3-flash-preview', 
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: nutritionSchema,
    temperature: 0.4,
  }
};

// Analyze food image function
export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<NutritionAnalysis> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: analyzeImageConfig.model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `You are a professional AI Nutrition Analyst. Analyze the food in this image.
            1. Identify the food item(s).
            2. Estimate portion size.
            3. Break into ingredients.
            4. Estimate calories.
            5. Sum total calories.
            6. Provide a simple explanation.
            7. Add a medical disclaimer.
            Return a valid JSON matching the schema.` }
        ]
      },
      config: analyzeImageConfig.generationConfig
    });

    let text = response.text || "";
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
    return JSON.parse(text) as NutritionAnalysis;

  } catch (error: any) {
    console.error("Error analyzing image:", error);
    let msg = error.message || "Unknown error";
    if (msg.includes("400")) msg = "Bad Request: Image unclear or unsupported.";
    if (msg.includes("401") || msg.includes("API Key")) msg = "Authentication failed. Check your API Key.";
    if (msg.includes("503")) msg = "Service overloaded. Try again later.";
    throw new Error(msg);
  }
};

// Follow-up chat function
export const sendFollowUpMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  currentContext: NutritionAnalysis
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview", 
      config: {
        systemInstruction: `You are a helpful AI Nutritionist.
        The user analyzed a food image:
        Food: ${currentContext.foodName}
        Ingredients: ${JSON.stringify(currentContext.ingredients)}
        Total Calories: ${currentContext.totalCalories}
        Answer concisely and politely.`
      },
      history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Couldn't generate a response. Try again.";

  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};