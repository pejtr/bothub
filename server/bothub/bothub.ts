/**
 * BotHub Chat Service for iBots
 * Uses the built-in LLM integration to power AI chatbot conversations
 * Each iBot has a unique system prompt based on their personality and expertise
 */

import { invokeLLM } from "../_core/llm";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  botId: string;
  botName: string;
  botSpecialty: string;
  botPersonality?: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  content: string;
  tokensUsed?: number;
}

/**
 * Generate a system prompt for a specific iBot personality
 */
function generateSystemPrompt(botName: string, botSpecialty: string, botPersonality?: string): string {
  const basePrompt = `Jsi ${botName}, AI asistent specializující se na ${botSpecialty}. 
Odpovídáš v češtině, pokud uživatel nepoužije jiný jazyk.
Tvé odpovědi jsou praktické, konkrétní a zaměřené na výsledky.
Vždy se snažíš poskytnout actionable rady, které může uživatel okamžitě implementovat.`;

  if (botPersonality) {
    return `${basePrompt}\n\nTvá osobnost: ${botPersonality}\n\nDržíš se svého charakteru a přístupu ve všech odpovědích.`;
  }

  return basePrompt;
}

/**
 * Heritage Collection system prompts with special handling for villain advisors
 */
function generateHeritagePrompt(botName: string, botSpecialty: string, side: string, botPersonality?: string): string {
  if (side === "villain") {
    return `Jsi ${botName} - DARK SIDE ADVISOR v Heritage Collection.
Tvá role: ${botSpecialty}
${botPersonality ? `Osobnost: ${botPersonality}` : ""}

DŮLEŽITÉ: Jsi vzdělávací nástroj. Tvým cílem je naučit uživatele ROZPOZNÁVAT a BRÁNIT SE negativním vzorcům chování.
Analyzuješ historické příklady manipulace, toxického leadershipu a neetického jednání z EDUKATIVNÍ perspektivy.
Vždy končíš praktickými radami, jak se těmto vzorcům bránit v moderním byznysu a osobním životě.
Odpovídáš v češtině.`;
  }

  return `Jsi ${botName} - historická osobnost v Heritage Collection.
Tvá expertise: ${botSpecialty}
${botPersonality ? `Osobnost: ${botPersonality}` : ""}

Sdílíš moudrost a zkušenosti ze svého života a doby. Propojuješ historické lekce s moderními výzvami.
Tvé rady jsou praktické a inspirativní. Odpovídáš v češtině.`;
}

/**
 * Send a chat message to the LLM and get a response
 */
export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { botId, botName, botSpecialty, botPersonality, messages } = request;

  // Determine if this is a Heritage Collection bot
  const isHeritage = botId.startsWith("hw-") || botId.startsWith("vw-");
  const isVillain = botId.startsWith("vw-");

  const systemPrompt = isHeritage
    ? generateHeritagePrompt(botName, botSpecialty, isVillain ? "villain" : "hero", botPersonality)
    : generateSystemPrompt(botName, botSpecialty, botPersonality);

  const llmMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const response = await invokeLLM({
      messages: llmMessages,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "Omlouvám se, nepodařilo se mi vygenerovat odpověď. Zkuste to prosím znovu.";

    return {
      content,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error: any) {
    console.error(`[BotHub] Chat error for ${botName}:`, error.message);
    throw new Error(`Chat service temporarily unavailable: ${error.message}`);
  }
}
