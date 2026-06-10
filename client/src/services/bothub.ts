/**
 * BotHub API Service
 * Handles communication with external BotHub API (api.bothub.cz)
 * 
 * Note: This is a frontend-only implementation.
 * For production use with sensitive API keys, you would need to:
 * 1. Upgrade to web-db-user feature for backend support
 * 2. Create backend proxy endpoints to securely call BotHub API
 */

// API Configuration
const BOTHUB_API_BASE = "https://api.bothub.cz";

// Types
export interface BotHubBot {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar?: string;
  systemPrompt?: string;
  isActive: boolean;
}

export interface BotHubConversation {
  id: string;
  botId: string;
  userId: string;
  messages: BotHubMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BotHubMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface BotHubUser {
  id: string;
  email: string;
  plan: "FREE" | "GOLD" | "DIAMOND";
  affiliateCode?: string;
  affiliateEarnings?: number;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * BotHub API Client
 * 
 * Usage example (when backend is available):
 * const client = new BotHubClient(apiKey);
 * const bots = await client.getBots();
 */
export class BotHubClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = BOTHUB_API_BASE) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("BotHub API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Bot Management
  async getBots(): Promise<ApiResponse<BotHubBot[]>> {
    return this.request<BotHubBot[]>("/api/v1/bots");
  }

  async getBot(botId: string): Promise<ApiResponse<BotHubBot>> {
    return this.request<BotHubBot>(`/api/v1/bots/${botId}`);
  }

  async createBot(bot: Partial<BotHubBot>): Promise<ApiResponse<BotHubBot>> {
    return this.request<BotHubBot>("/api/v1/bots", {
      method: "POST",
      body: JSON.stringify(bot),
    });
  }

  // Conversation Management
  async startConversation(
    botId: string,
    userId: string
  ): Promise<ApiResponse<BotHubConversation>> {
    return this.request<BotHubConversation>("/api/v1/conversations", {
      method: "POST",
      body: JSON.stringify({ botId, userId }),
    });
  }

  async sendMessage(
    conversationId: string,
    message: string
  ): Promise<ApiResponse<BotHubMessage>> {
    return this.request<BotHubMessage>(
      `/api/v1/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content: message }),
      }
    );
  }

  async getConversation(
    conversationId: string
  ): Promise<ApiResponse<BotHubConversation>> {
    return this.request<BotHubConversation>(
      `/api/v1/conversations/${conversationId}`
    );
  }

  // User Management
  async getUser(userId: string): Promise<ApiResponse<BotHubUser>> {
    return this.request<BotHubUser>(`/api/v1/users/${userId}`);
  }

  async updateUserPlan(
    userId: string,
    plan: "FREE" | "GOLD" | "DIAMOND"
  ): Promise<ApiResponse<BotHubUser>> {
    return this.request<BotHubUser>(`/api/v1/users/${userId}/plan`, {
      method: "PUT",
      body: JSON.stringify({ plan }),
    });
  }

  // Affiliate System
  async getAffiliateStats(
    affiliateCode: string
  ): Promise<ApiResponse<{ referrals: number; earnings: number }>> {
    return this.request<{ referrals: number; earnings: number }>(
      `/api/v1/affiliate/${affiliateCode}/stats`
    );
  }

  async generateAffiliateLink(
    userId: string
  ): Promise<ApiResponse<{ code: string; link: string }>> {
    return this.request<{ code: string; link: string }>(
      `/api/v1/users/${userId}/affiliate`,
      { method: "POST" }
    );
  }
}

/**
 * Mock BotHub Client for demo purposes
 * Returns simulated data without actual API calls
 */
export class MockBotHubClient {
  async getBots(): Promise<ApiResponse<BotHubBot[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: [
        {
          id: "alex-hormozi",
          name: "Alex Hormozi",
          description: "Business growth expert",
          category: "sales",
          isActive: true,
        },
        {
          id: "carl-jung",
          name: "Carl Jung",
          description: "Shadow work specialist",
          category: "therapy",
          isActive: true,
        },
        // ... more bots would be returned from actual API
      ],
    };
  }

  async sendMessage(
    _conversationId: string,
    message: string
  ): Promise<ApiResponse<BotHubMessage>> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `This is a simulated response to: "${message}". In production, this would be powered by the BotHub API.`,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Export singleton instances
export const mockBotHub = new MockBotHubClient();

// Helper function to get client based on environment
export function getBotHubClient(apiKey?: string): BotHubClient | MockBotHubClient {
  if (apiKey) {
    return new BotHubClient(apiKey);
  }
  // Return mock client for demo/development
  return mockBotHub;
}
