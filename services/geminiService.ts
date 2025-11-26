import { GoogleGenAI, Type } from "@google/genai";
import { VehicleType, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeItemImage = async (
  base64Image: string | null, 
  description: string,
  distanceMiles: number
): Promise<AIAnalysisResult> => {
  
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return {
      vehicleType: VehicleType.PICKUP,
      estimatedWeightLb: 150,
      difficultyScore: 5,
      reasoning: "API Key missing. Defaulting to Pickup Truck.",
      suggestedPrice: 45
    };
  }

  try {
    const model = "gemini-2.5-flash";
    
    const parts: any[] = [];
    
    if (base64Image) {
        // Strip the data:image/jpeg;base64, prefix if present
        const cleanBase64 = base64Image.includes(',') 
            ? base64Image.split(',')[1] 
            : base64Image;

        parts.push({
            inlineData: {
                data: cleanBase64,
                mimeType: "image/jpeg"
            }
        });
    }

    parts.push({
        text: `You are a logistics expert for a peer-to-peer delivery app. 
        A user needs a free item picked up. 
        Description: ${description}. 
        Distance: ${distanceMiles} miles.
        
        Analyze the item (and image if provided) to determine the best vehicle, weight, difficulty, and a fair price for a driver.

        Please specifically consider:
        1. FRAGILITY: Is the item delicate (e.g., glass, antique, electronics) or robust?
        2. PACKING REQUIREMENTS: Does it need moving blankets, tie-downs, bubble wrap, or careful stacking?
        3. HANDLING: Does it require two people to lift?

        Factor these handling needs into the 'difficultyScore' and 'suggestedPrice'.
        
        In the 'reasoning' field, explain your vehicle choice AND explicitly list any necessary packing materials or handling cautions (e.g. "Requires 2 people," "Needs blankets for glass").`
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleType: {
              type: Type.STRING,
              enum: [
                'Sedan (Small Items)',
                'SUV (Medium Items)',
                'Pickup Truck (Large Items)',
                'Box Truck (Whole Room)',
                'Cargo Van (Weather Sensitive)'
              ]
            },
            estimatedWeightLb: { type: Type.NUMBER },
            difficultyScore: { type: Type.NUMBER, description: "1 is easy (lamp), 10 is hard (piano)" },
            reasoning: { type: Type.STRING, description: "Explain vehicle choice and list specific packing/handling requirements." },
            suggestedPrice: { type: Type.NUMBER, description: "In USD" }
          },
          required: ["vehicleType", "estimatedWeightLb", "difficultyScore", "reasoning", "suggestedPrice"]
        }
      }
    });

    if (response.text) {
        const result = JSON.parse(response.text) as AIAnalysisResult;
        return result;
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback for safety
    return {
      vehicleType: VehicleType.PICKUP,
      estimatedWeightLb: 0,
      difficultyScore: 5,
      reasoning: "AI Analysis unavailable. Please estimate manually.",
      suggestedPrice: 50
    };
  }
};