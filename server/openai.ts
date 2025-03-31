import OpenAI from "openai";
import { ChatMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

// This function formats messages for the OpenAI API
function formatMessagesForOpenAI(userQuery: string, previousMessages: ChatMessage[]): Array<{ role: string, content: string }> {
  // System message with instructions for Ara's persona
  const systemMessage = {
    role: "system",
    content: `You are Ara, an AI career coach for high school students on the 'Your Next Step' educational platform. 
    Your purpose is to provide personalized career guidance, education planning, and skill development advice.
    
    Be conversational, encouraging, and focused on helping students:
    - Explore career paths based on their interests
    - Understand education requirements for different careers
    - Develop relevant skills while still in high school
    - Prepare for college applications and interviews
    - Build confidence in their career journey
    
    Keep responses concise, practical, and tailored for high school students. 
    When appropriate, mention the platform's modules or curriculum that might help them.
    Always maintain an optimistic, supportive tone that motivates students to engage with career exploration.`
  };
  
  // Convert previous messages to the format expected by OpenAI
  const conversationHistory = previousMessages.map(msg => ({
    role: msg.isFromUser ? "user" : "assistant",
    content: msg.message
  }));
  
  // Add the current user query
  const currentQuery = {
    role: "user",
    content: userQuery
  };
  
  // Combine all messages
  return [systemMessage, ...conversationHistory, currentQuery];
}

export async function generateAIResponse(userQuery: string, previousMessages: ChatMessage[]): Promise<string> {
  try {
    // Format messages for OpenAI
    const messages = formatMessagesForOpenAI(userQuery, previousMessages);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any, // Type cast to satisfy TypeScript
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fallback response if OpenAI API fails
    return "I'm currently having trouble connecting to my knowledge base. Let's try a different question, or you can try again later.";
  }
}

// Function for generating career recommendations based on user progress and interests
export async function generateCareerRecommendations(interests: string[], completedModules: string[]): Promise<any> {
  try {
    const prompt = `Based on a student's interests (${interests.join(", ")}) 
    and completed educational modules (${completedModules.join(", ")}), 
    suggest 3 potential career paths. For each career, provide:
    1. Job title
    2. Brief description (1-2 sentences)
    3. Match score (0-100)
    4. Field of study
    5. Average salary
    6. Education requirements
    
    Format the response as a JSON array.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a career recommendation AI that provides targeted career suggestions for high school students." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    const recommendations = JSON.parse(response.choices[0].message.content);
    return recommendations;
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    
    // Return fallback recommendations
    return [
      {
        title: "Software Developer",
        description: "Design and develop computer applications",
        matchScore: 85,
        fieldOfStudy: "Computer Science",
        avgSalary: 105000,
        eduRequirements: "Bachelor's degree in Computer Science"
      },
      {
        title: "Marketing Specialist",
        description: "Create and implement marketing strategies",
        matchScore: 75,
        fieldOfStudy: "Marketing, Business",
        avgSalary: 65000,
        eduRequirements: "Bachelor's degree in Marketing or Business"
      },
      {
        title: "Healthcare Administrator",
        description: "Manage healthcare facilities and services",
        matchScore: 70,
        fieldOfStudy: "Healthcare Administration",
        avgSalary: 80000,
        eduRequirements: "Bachelor's degree in Healthcare Administration"
      }
    ];
  }
}
