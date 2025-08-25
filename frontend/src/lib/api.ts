const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Campaign API
  async getCampaigns(): Promise<ApiResponse<any[]>> {
    return this.request('/api/campaigns');
  }

  async getCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/campaigns/${id}`);
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<any>> {
    return this.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(id: string, campaignData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Character API
  async getCharacters(): Promise<ApiResponse<any[]>> {
    return this.request('/api/characters');
  }

  async getCharacter(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/characters/${id}`);
  }

  async createCharacter(characterData: any): Promise<ApiResponse<any>> {
    return this.request('/api/characters', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacter(id: string, characterData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(characterData),
    });
  }

  async deleteCharacter(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // Session API
  async getSessions(): Promise<ApiResponse<any[]>> {
    return this.request('/api/sessions');
  }

  async getSession(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/sessions/${id}`);
  }

  async createSession(sessionData: any): Promise<ApiResponse<any>> {
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(id: string, sessionData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Location API
  async getLocations(): Promise<ApiResponse<any[]>> {
    return this.request('/api/locations');
  }

  async getLocation(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/locations/${id}`);
  }

  async createLocation(locationData: any): Promise<ApiResponse<any>> {
    return this.request('/api/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updateLocation(id: string, locationData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async deleteLocation(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Gameplay API
  async startGameSession(sessionData: any): Promise<ApiResponse<any>> {
    return this.request('/api/gameplay/start-session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async sendGameMessage(messageData: any): Promise<ApiResponse<any>> {
    return this.request('/api/gameplay/message', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async performAction(actionData: any): Promise<ApiResponse<any>> {
    return this.request('/api/gameplay/action', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  // Combat API
  async initiateCombat(combatData: any): Promise<ApiResponse<any>> {
    return this.request('/api/combat/initiate', {
      method: 'POST',
      body: JSON.stringify(combatData),
    });
  }

  async performCombatAction(actionData: any): Promise<ApiResponse<any>> {
    return this.request('/api/combat/action', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  // Quest API
  async getQuests(): Promise<ApiResponse<any[]>> {
    return this.request('/api/quests');
  }

  async createQuest(questData: any): Promise<ApiResponse<any>> {
    return this.request('/api/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  async updateQuest(id: string, questData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
