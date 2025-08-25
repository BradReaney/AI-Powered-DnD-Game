import type { Campaign, Character, Location, Session } from "./types";
import {
  adaptCampaign,
  adaptCharacter,
  adaptLocation,
  adaptSession,
} from "./adapters";

// Use relative URLs for Next.js API routes in production
const API_BASE_URL = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL && typeof window === 'undefined') {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required for server-side requests');
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Use relative URL for client-side requests, full URL for server-side
    const url = typeof window !== 'undefined' 
      ? `/api${endpoint}` 
      : `${API_BASE_URL}/api${endpoint}`;

    const headers: Record<string, string> = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...options.headers,
    };

    // Only set Content-Type for requests with a body
    if (options.method && ["POST", "PUT", "PATCH"].includes(options.method)) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      headers,
      cache: "no-store",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    // Call backend directly since we're using standalone output
    const backendCampaigns = await this.request<any[]>('/campaigns');
    return backendCampaigns.map(adaptCampaign);
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    const backendCampaign = await this.request<any>(`/campaigns/${campaignId}`);
    return adaptCampaign(backendCampaign);
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    // Call backend directly since we're using standalone output
    const backendCampaign = await this.request<any>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
    return adaptCampaign(backendCampaign);
  }

  async updateCampaign(
    campaignId: string,
    campaignData: Partial<Campaign>,
  ): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${campaignId}`, {
      method: "PUT",
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    return this.request<void>(`/campaigns/${campaignId}`, {
      method: "DELETE",
    });
  }

  async initializeCampaign(
    campaignId: string,
    sessionId: string,
    characterIds?: string[]
  ): Promise<{
    message: string;
    content: string;
    metadata: any;
  }> {
    // Call Next.js API route instead of backend directly
    return await this.request<any>(`/campaigns/${campaignId}/initialize`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        characterIds,
      }),
    });
  }

  // Characters
  async getCharacters(): Promise<Character[]> {
    // Since there's no general get all characters endpoint, we'll need to get them by campaign
    // For now, return empty array and handle this in the components
    return [];
  }

  async getCharactersByCampaign(campaignId: string): Promise<Character[]> {
    // Call backend directly since we're using standalone output
    const backendCharacters = await this.request<any[]>(`/characters?campaignId=${campaignId}`);
    return backendCharacters.map(adaptCharacter);
  }

  async getCharacter(characterId: string): Promise<Character> {
    const backendCharacter = await this.request<any>(
      `/characters/${characterId}`,
    );
    return adaptCharacter(backendCharacter);
  }

  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    return this.request<Character>("/characters", {
      method: "POST",
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacter(
    characterId: string,
    characterData: Partial<Character>,
  ): Promise<Character> {
    return this.request<Character>(`/characters/${characterId}`, {
      method: "PUT",
      body: JSON.stringify(characterData),
    });
  }

  async deleteCharacter(characterId: string): Promise<void> {
    return this.request<void>(`/characters/${characterId}`, {
      method: "DELETE",
    });
  }

  // Sessions
  async getSessionsByCampaign(campaignId: string): Promise<Session[]> {
    const response = await this.request<{ sessions: any[] }>(
      `/sessions/campaign/${campaignId}`,
    );
    return response.sessions.map(adaptSession);
  }

  async getSession(sessionId: string): Promise<Session> {
    const backendSession = await this.request<any>(`/sessions/${sessionId}`);
    return adaptSession(backendSession);
  }

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    return this.request<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(
    sessionId: string,
    sessionData: Partial<Session>,
  ): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    // Since there's no general get all locations endpoint, we'll need to get them by campaign
    // For now, return empty array and handle this in the components
    return [];
  }

  async getLocationsByCampaign(campaignId: string): Promise<Location[]> {
    // Call backend directly since we're using standalone output
    const backendLocations = await this.request<any[]>(`/locations?campaignId=${campaignId}`);
    return backendLocations.map(adaptLocation);
  }

  async getLocation(locationId: string): Promise<Location> {
    const backendLocation = await this.request<any>(`/locations/${locationId}`);
    return adaptLocation(backendLocation);
  }

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    return this.request<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  }

  async updateLocation(
    locationId: string,
    locationData: Partial<Location>,
  ): Promise<Location> {
    return this.request<Location>(`/locations/${locationId}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    });
  }

  async deleteLocation(locationId: string): Promise<void> {
    return this.request<void>(`/locations/${locationId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
