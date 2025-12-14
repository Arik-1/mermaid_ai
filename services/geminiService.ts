import { GoogleGenAI } from "@google/genai";

// Lazy initialization to avoid top-level execution crashes
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    // Defensive check for process.env
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    if (!apiKey) {
        console.error("API_KEY is missing from process.env");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
  }
  return aiInstance;
};

const MERMAID_SYSTEM_INSTRUCTION = `
You are an expert in Mermaid JS diagramming. 
When asked to generate code, return ONLY the valid Mermaid code. 
Do not wrap it in markdown code blocks (like \`\`\`mermaid). 
Do not add explanation text before or after the code.
Just the raw code string.

IMPORTANT: Avoid using double quotes (") inside node labels as they often cause syntax errors. 
Use single quotes (') instead. 
Example: Use A[User 'Login'] instead of A[User "Login"].
`;

const EXPLANATION_SYSTEM_INSTRUCTION = `
You are a technical documenter. 
Your job is to explain Mermaid JS diagrams in simple, clear, concise English.
Focus on the flow, logic, and relationships described in the diagram.
`;

/**
 * Sanitizes Mermaid code to fix common syntax errors, specifically double quotes inside labels.
 */
export const sanitizeMermaidCode = (code: string): string => {
  let clean = code;
  
  // Helper to replace quotes inside delimiters
  // Targets: [], (), {}
  
  // 1. Square Brackets [...]
  clean = clean.replace(/\[(.*?)\]/g, (match, content) => {
      if (content.startsWith('"') && content.endsWith('"') && content.length > 1) {
          // If wrapped in quotes, preserve wrapper but fix inner quotes
          const inner = content.slice(1, -1).replace(/"/g, "'");
          return `["${inner}"]`;
      }
      // Otherwise replace all double quotes with single quotes
      return `[${content.replace(/"/g, "'")}]`;
  });
  
  // 2. Round Brackets (...)
  clean = clean.replace(/\((.*?)\)/g, (match, content) => {
      if (content.startsWith('"') && content.endsWith('"') && content.length > 1) {
          const inner = content.slice(1, -1).replace(/"/g, "'");
          return `("${inner}")`;
      }
      return `(${content.replace(/"/g, "'")})`;
  });
  
  // 3. Curly Brackets {...}
  clean = clean.replace(/\{(.*?)\}/g, (match, content) => {
       if (content.startsWith('"') && content.endsWith('"') && content.length > 1) {
          const inner = content.slice(1, -1).replace(/"/g, "'");
          return `{"${inner}"}`;
      }
      return `{${content.replace(/"/g, "'")}}`;
  });

  return clean;
};

export const generateMermaidFromText = async (prompt: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: MERMAID_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for deterministic code
      },
    });
    
    let code = response.text || '';
    
    // Cleanup in case model ignores instruction
    code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    
    return sanitizeMermaidCode(code);
  } catch (error) {
    console.error("Gemini API Error (Text to Mermaid):", error);
    throw new Error("Failed to generate diagram code.");
  }
};

export const generateTextFromMermaid = async (mermaidCode: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain this Mermaid diagram:\n\n${mermaidCode}`,
      config: {
        systemInstruction: EXPLANATION_SYSTEM_INSTRUCTION,
      },
    });
    
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error (Mermaid to Text):", error);
    throw new Error("Failed to explain diagram.");
  }
};

export const generateRandomDescription = async (): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
      Generate a single, short paragraph describing a system flow, process, or hierarchy.
      It should be suitable for visualizing as a flowchart, sequence diagram, or state diagram.
      Examples: 
      - "A user logs into a banking app. If the password is correct, they see their balance. If not, they get an error."
      - "A traffic light system cycles from Green to Yellow to Red, then back to Green. If a pedestrian pushes the button, it interrupts."
      - "A biological food chain where grass is eaten by zebras, and zebras are eaten by lions."
      
      Output ONLY the description text. Keep it under 50 words. Be creative.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0, 
      },
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error("Gemini API Error (Random Desc):", error);
    throw new Error("Failed to generate random description.");
  }
};