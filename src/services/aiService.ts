import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const getApiKey = () => {
  // @ts-ignore
  const key = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null) || (import.meta as any).env.VITE_GEMINI_API_KEY;
  return key;
};

const getAi = () => {
  const key = getApiKey();
  if (!key) {
    throw new Error("Gemini API Key is missing. Please ensure GEMINI_API_KEY is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function deepThink(message: string, context: any = {}): Promise<string> {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Context: ${JSON.stringify(context)}\n\nQuery: ${message}`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: "You are M3allem En Click Deep Thinker. You provide highly detailed, expert-level analysis and solutions for complex home maintenance, technical, or business problems in the Moroccan context."
      }
    });
    return response.text || "I'm sorry, I couldn't process that complex request.";
  } catch (error) {
    console.error("Deep Think Error:", error);
    return "I'm having trouble with my deep reasoning right now.";
  }
}

export async function getSuggestedPrice(
  categoryName: string, 
  description: string, 
  isUrgent: boolean, 
  city: string
): Promise<{ price: number; reasoning: string }> {
  try {
    const ai = getAi();

    const prompt = `
      You are an AI assistant for a professional artisan marketplace in Morocco (M3allem En Click).
      Suggest a fair and competitive price (in MAD) for the following service request to help the artisan win the job.
      
      Service Category: ${categoryName}
      Description: ${description}
      Urgency: ${isUrgent ? 'Urgent' : 'Normal'}
      City: ${city}
      
      Return a JSON object with:
      - price: a single number representing the suggested price in MAD.
      - reasoning: a short (1-2 sentences) explanation of why this price is competitive (e.g., based on market average, urgency premium, or job complexity).
      
      Keep the price realistic for the Moroccan market.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      price: result.price || 200,
      reasoning: result.reasoning || "Based on typical market rates for this service."
    };
  } catch (error) {
    console.error("Gemini pricing suggestion error:", error);
    return {
      price: 200,
      reasoning: "Based on standard base rates for this category."
    };
  }
}

export async function getRecommendations(userId: string): Promise<any[]> {
  try {
    const ai = getAi();
    const prompt = `Suggest 5 recommended artisan services for user ${userId} based on popular home maintenance needs in Morocco. Return a JSON array of objects with id, name, category, and rating.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function getSuggestions(query: string): Promise<string[]> {
  try {
    const ai = getAi();
    const prompt = `Provide 5 search suggestions for home services in Morocco starting with or related to "${query}". Return a JSON array of strings.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function getSmartMatch(lat: number, lng: number): Promise<any[]> {
  try {
    const ai = getAi();
    const prompt = `Find the best matching artisans near latitude ${lat} and longitude ${lng}. Return a JSON array of 3 artisan objects with id, name, specialty, and matchScore (0-100).`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function suggestServiceFromProblem(problem: string): Promise<{ categoryId: string; categoryName: string; suggestedServiceName: string; }> {
  try {
    const ai = getAi();
    const prompt = `Based on this problem: "${problem}", suggest the most appropriate service. Return a JSON object with categoryId (e.g., cat_1), categoryName (e.g., Plumbing), and suggestedServiceName (e.g., Leak Repair).`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || '{}');
    return {
      categoryId: result.categoryId || "cat_1",
      categoryName: result.categoryName || "General",
      suggestedServiceName: result.suggestedServiceName || "General Maintenance"
    };
  } catch (error) {
    return { categoryId: "cat_1", categoryName: "General", suggestedServiceName: "General Maintenance" };
  }
}

export async function chatWithAi(message: string, history: any[]): Promise<string> {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: { systemInstruction: "You are M3allem En Click AI, a helpful assistant for a home services marketplace in Morocco." }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    return "I'm having trouble connecting right now.";
  }
}

export async function getAutoEstimate(
  serviceType: string, 
  description: string, 
  city: string, 
  urgency: string,
  categoryId?: string
): Promise<any> {
  try {
    const ai = getAi();
    
    let marketContext = "";
    if (categoryId && city) {
      try {
        const token = localStorage.getItem('m3allem_token');
        const res = await fetch(`/api/bookings/market-data?categoryId=${categoryId}&city=${city}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          marketContext = `
            Market Data for this category in ${city}:
            - Average historical price: ${data.avgHistoricalPrice} MAD
            - Total completed jobs: ${data.totalCompleted}
            - Current active requests (Demand): ${data.activeRequests}
            - Online artisans available (Supply): ${data.onlineArtisans}
          `;
        }
      } catch (e) {
        console.warn("Could not fetch market data for AI estimate", e);
      }
    }

    const prompt = `
      Provide a detailed price estimate for: ${description} in category ${serviceType}. 
      Urgency: ${urgency}, City: ${city}.
      ${marketContext}
      
      Consider the Moroccan market, the complexity of the description, and the provided market data (if any).
      If demand is high and supply is low, adjust the price slightly upwards.
      If it's a common job with many artisans, keep it competitive.
      
      Return JSON with:
      - suggested: (number) the recommended price in MAD.
      - minPrice: (number) the minimum fair price.
      - maxPrice: (number) the maximum fair price.
      - breakdown: (array of strings) explaining the cost components (e.g., "Labor", "Travel", "Urgency premium").
      - marketInsight: (string) a short sentence about the current market condition for this job.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
      suggested: result.suggested || 200,
      minPrice: result.minPrice || 150,
      maxPrice: result.maxPrice || 300,
      breakdown: result.breakdown || ["Standard labor", "Basic materials"],
      marketInsight: result.marketInsight || "Based on typical market rates."
    };
  } catch (error) {
    console.error("Auto estimate error:", error);
    return { 
      suggested: 200, 
      minPrice: 150, 
      maxPrice: 300, 
      breakdown: ["Standard labor", "Basic materials"],
      marketInsight: "Unable to analyze market data at this time."
    };
  }
}

export async function matchServiceFromArtisan(description: string, services: any[]): Promise<string> {
  try {
    const ai = getAi();
    const prompt = `Based on this job description: "${description}", select the best matching service from this list: ${JSON.stringify(services?.map(s => ({ id: s.id, name: s.name })))}. Return only the id of the best matching service.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text?.trim() || (services[0]?.id || "");
  } catch (error) {
    return services[0]?.id || "";
  }
}

export async function getAdminInsights(systemData: any, history: any[] = []): Promise<any> {
  try {
    const ai = getAi();
    const prompt = `
      Analyze this system data for the M3allem En Click platform (Moroccan artisan marketplace): ${JSON.stringify(systemData)}.
      Past issues and successful fixes for learning: ${JSON.stringify(history)}.
      
      Provide a comprehensive AI System Audit.
      
      Return a JSON object with the following structure:
      {
        "healthScore": number (0-100),
        "issues": [
          {
            "title": string,
            "description": string,
            "severity": "Critical" | "High" | "Medium" | "Low",
            "type": "bug" | "business" | "behavior",
            "context": { "serviceType": string, "city": string, "userType": string }
          }
        ],
        "suggestions": [
          {
            "title": string,
            "description": string,
            "confidence": number (0-100),
            "riskLevel": "Safe" | "Advanced",
            "impact": { "performance": string, "revenue": string },
            "simulation": { "expectedImprovement": string, "beforeAfterComparison": string },
            "technicalSolution": { "code": string, "query": string, "optimization": string }
          }
        ],
        "businessInsights": {
          "revenueLoss": string,
          "userDropOffs": string,
          "behaviorIssues": string
        },
        "predictiveAlerts": [
          { "alert": string, "forecast": string, "timeframe": string }
        ]
      }
      
      Requirements:
      1. Context-Aware: Include service type, city, and user type in issues.
      2. Smart Prioritization: Rank issues by severity.
      3. Confidence & Risk: Each suggestion must have a confidence % and risk level (Safe vs Advanced).
      4. Simulation: Show expected performance improvement and a before/after comparison summary.
      5. Business Layer: Detect revenue loss, user drop-offs, and behavior issues.
      6. Predictive: Forecast system issues before they happen.
      7. Developer Mode: Provide technical solutions (code, queries, or optimizations).
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || '{}');
    return {
      healthScore: result.healthScore || 85,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      businessInsights: result.businessInsights || { revenueLoss: "None detected", userDropOffs: "Stable", behaviorIssues: "Normal" },
      predictiveAlerts: result.predictiveAlerts || []
    };
  } catch (error) {
    console.error("AI Insights Error:", error);
    return { 
      healthScore: 85, 
      issues: [], 
      suggestions: [], 
      businessInsights: { revenueLoss: "Error analyzing", userDropOffs: "Error analyzing", behaviorIssues: "Error analyzing" },
      predictiveAlerts: []
    };
  }
}

export async function generateDemoVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<any> {
  try {
    const ai = getAi();
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
    return operation;
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
}

export async function getVideosOperation(operation: any): Promise<any> {
  try {
    const ai = getAi();
    return await ai.operations.getVideosOperation({ operation });
  } catch (error) {
    console.error("Get Video Operation Error:", error);
    throw error;
  }
}

export async function generateImage(prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string> {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}

export async function editImage(prompt: string, imageBase64: string): Promise<string> {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1] || imageBase64, mimeType: "image/png" } },
          { text: prompt }
        ]
      }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
}

export async function generateVeoVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<any> {
  try {
    const ai = getAi();
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
    return operation;
  } catch (error) {
    console.error("Veo Video Generation Error:", error);
    throw error;
  }
}

export async function animateImageToVideo(prompt: string, imageBase64: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<any> {
  try {
    const ai = getAi();
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBase64.split(',')[1] || imageBase64,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
    return operation;
  } catch (error) {
    console.error("Animate Image Error:", error);
    throw error;
  }
}

export const aiService = {
  getApiKey,
  getSuggestedPrice,
  getRecommendations,
  getSuggestions,
  getSmartMatch,
  suggestServiceFromProblem,
  chatWithAi,
  getAutoEstimate,
  matchServiceFromArtisan,
  getAdminInsights,
  deepThink,
  generateDemoVideo,
  getVideosOperation,
  generateImage,
  editImage,
  generateVeoVideo,
  animateImageToVideo
};
