import { apiService, ApiResponse } from './api';
import { mockCampaigns, mockCharacters, mockLocations, mockSessions } from './mock-data';
import type { Campaign, Character, Location, Session } from './types';

class DataService {
  private useMockData = true; // Set to false when backend is fully integrated
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    if (this.useMockData) {
      return mockCampaigns;
    }

    const cached = this.getCache('campaigns');
    if (cached) return cached;

    try {
      const response = await apiService.getCampaigns();
      if (response.data) {
        this.setCache('campaigns', response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch campaigns');
    } catch (error) {
      console.error('Failed to fetch campaigns from API, using mock data:', error);
      return mockCampaigns;
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    if (this.useMockData) {
      return mockCampaigns.find(c => c.id === id) || null;
    }

    const cached = this.getCache(`campaign-${id}`);
    if (cached) return cached;

    try {
      const response = await apiService.getCampaign(id);
      if (response.data) {
        this.setCache(`campaign-${id}`, response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch campaign');
    } catch (error) {
      console.error('Failed to fetch campaign from API, using mock data:', error);
      return mockCampaigns.find(c => c.id === id) || null;
    }
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    if (this.useMockData) {
      const newCampaign: Campaign = {
        ...campaignData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        sessions: [],
      } as Campaign;
      
      // Add to mock data
      mockCampaigns.push(newCampaign);
      this.clearCache(); // Clear cache to force refresh
      return newCampaign;
    }

    try {
      const response = await apiService.createCampaign(campaignData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to create campaign');
    } catch (error) {
      console.error('Failed to create campaign via API:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    if (this.useMockData) {
      const index = mockCampaigns.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Campaign not found');
      
      const updatedCampaign = {
        ...mockCampaigns[index],
        ...campaignData,
        updatedAt: new Date(),
      };
      
      mockCampaigns[index] = updatedCampaign;
      this.clearCache(); // Clear cache to force refresh
      return updatedCampaign;
    }

    try {
      const response = await apiService.updateCampaign(id, campaignData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to update campaign');
    } catch (error) {
      console.error('Failed to update campaign via API:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockCampaigns.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCampaigns.splice(index, 1);
        this.clearCache(); // Clear cache to force refresh
      }
      return;
    }

    try {
      const response = await apiService.deleteCampaign(id);
      if (response.error) {
        throw new Error(response.error);
      }
      this.clearCache(); // Clear cache to force refresh
    } catch (error) {
      console.error('Failed to delete campaign via API:', error);
      throw error;
    }
  }

  // Character methods
  async getCharacters(): Promise<Character[]> {
    if (this.useMockData) {
      return mockCharacters;
    }

    const cached = this.getCache('characters');
    if (cached) return cached;

    try {
      const response = await apiService.getCharacters();
      if (response.data) {
        this.setCache('characters', response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch characters');
    } catch (error) {
      console.error('Failed to fetch characters from API, using mock data:', error);
      return mockCharacters;
    }
  }

  async getCharacter(id: string): Promise<Character | null> {
    if (this.useMockData) {
      return mockCharacters.find(c => c.id === id) || null;
    }

    const cached = this.getCache(`character-${id}`);
    if (cached) return cached;

    try {
      const response = await apiService.getCharacter(id);
      if (response.data) {
        this.setCache(`character-${id}`, response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch character');
    } catch (error) {
      console.error('Failed to fetch character from API, using mock data:', error);
      return mockCharacters.find(c => c.id === id) || null;
    }
  }

  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    if (this.useMockData) {
      const newCharacter: Character = {
        ...characterData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Character;
      
      // Add to mock data
      mockCharacters.push(newCharacter);
      this.clearCache(); // Clear cache to force refresh
      return newCharacter;
    }

    try {
      const response = await apiService.createCharacter(characterData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to create character');
    } catch (error) {
      console.error('Failed to create character via API:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, characterData: Partial<Character>): Promise<Character> {
    if (this.useMockData) {
      const index = mockCharacters.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Character not found');
      
      const updatedCharacter = {
        ...mockCharacters[index],
        ...characterData,
        updatedAt: new Date(),
      };
      
      mockCharacters[index] = updatedCharacter;
      this.clearCache(); // Clear cache to force refresh
      return updatedCharacter;
    }

    try {
      const response = await apiService.updateCharacter(id, characterData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to update character');
    } catch (error) {
      console.error('Failed to update character via API:', error);
      throw error;
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockCharacters.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCharacters.splice(index, 1);
        this.clearCache(); // Clear cache to force refresh
      }
      return;
    }

    try {
      const response = await apiService.deleteCharacter(id);
      if (response.error) {
        throw new Error(response.error);
      }
      this.clearCache(); // Clear cache to force refresh
    } catch (error) {
      console.error('Failed to delete character via API:', error);
      throw error;
    }
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    if (this.useMockData) {
      return mockLocations;
    }

    const cached = this.getCache('locations');
    if (cached) return cached;

    try {
      const response = await apiService.getLocations();
      if (response.data) {
        this.setCache('locations', response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch locations');
    } catch (error) {
      console.error('Failed to fetch locations from API, using mock data:', error);
      return mockLocations;
    }
  }

  async getLocation(id: string): Promise<Location | null> {
    if (this.useMockData) {
      return mockLocations.find(l => l.id === id) || null;
    }

    const cached = this.getCache(`location-${id}`);
    if (cached) return cached;

    try {
      const response = await apiService.getLocation(id);
      if (response.data) {
        this.setCache(`location-${id}`, response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch location');
    } catch (error) {
      console.error('Failed to fetch location from API, using mock data:', error);
      return mockLocations.find(l => l.id === id) || null;
    }
  }

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    if (this.useMockData) {
      const newLocation: Location = {
        ...locationData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Location;
      
      // Add to mock data
      mockLocations.push(newLocation);
      this.clearCache(); // Clear cache to force refresh
      return newLocation;
    }

    try {
      const response = await apiService.createLocation(locationData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to create location');
    } catch (error) {
      console.error('Failed to create location via API:', error);
      throw error;
    }
  }

  async updateLocation(id: string, locationData: Partial<Location>): Promise<Location> {
    if (this.useMockData) {
      const index = mockLocations.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Location not found');
      
      const updatedLocation = {
        ...mockLocations[index],
        ...locationData,
        updatedAt: new Date(),
      };
      
      mockLocations[index] = updatedLocation;
      this.clearCache(); // Clear cache to force refresh
      return updatedLocation;
    }

    try {
      const response = await apiService.updateLocation(id, locationData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to update location');
    } catch (error) {
      console.error('Failed to update location via API:', error);
      throw error;
    }
  }

  async deleteLocation(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockLocations.findIndex(l => l.id === id);
      if (index !== -1) {
        mockLocations.splice(index, 1);
        this.clearCache(); // Clear cache to force refresh
      }
      return;
    }

    try {
      const response = await apiService.deleteLocation(id);
      if (response.error) {
        throw new Error(response.error);
      }
      this.clearCache(); // Clear cache to force refresh
    } catch (error) {
      console.error('Failed to delete location via API:', error);
      throw error;
    }
  }

  // Session methods
  async getSessions(): Promise<Session[]> {
    if (this.useMockData) {
      return mockSessions;
    }

    const cached = this.getCache('sessions');
    if (cached) return cached;

    try {
      const response = await apiService.getSessions();
      if (response.data) {
        this.setCache('sessions', response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch sessions');
    } catch (error) {
      console.error('Failed to fetch sessions from API, using mock data:', error);
      return mockSessions;
    }
  }

  async getSession(id: string): Promise<Session | null> {
    if (this.useMockData) {
      return mockSessions.find(s => s.id === id) || null;
    }

    const cached = this.getCache(`session-${id}`);
    if (cached) return cached;

    try {
      const response = await apiService.getSession(id);
      if (response.data) {
        this.setCache(`session-${id}`, response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch session');
    } catch (error) {
      console.error('Failed to fetch session from API, using mock data:', error);
      return mockSessions.find(s => s.id === id) || null;
    }
  }

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    if (this.useMockData) {
      const newSession: Session = {
        ...sessionData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Session;
      
      // Add to mock data
      mockSessions.push(newSession);
      this.clearCache(); // Clear cache to force refresh
      return newSession;
    }

    try {
      const response = await apiService.createSession(sessionData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to create session');
    } catch (error) {
      console.error('Failed to create session via API:', error);
      throw error;
    }
  }

  async updateSession(id: string, sessionData: Partial<Session>): Promise<Session> {
    if (this.useMockData) {
      const index = mockSessions.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Session not found');
      
      const updatedSession = {
        ...mockSessions[index],
        ...sessionData,
        updatedAt: new Date(),
      };
      
      mockSessions[index] = updatedSession;
      this.clearCache(); // Clear cache to force refresh
      return updatedSession;
    }

    try {
      const response = await apiService.updateSession(id, sessionData);
      if (response.data) {
        this.clearCache(); // Clear cache to force refresh
        return response.data;
      }
      throw new Error(response.error || 'Failed to update session');
    } catch (error) {
      console.error('Failed to update session via API:', error);
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockSessions.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSessions.splice(index, 1);
        this.clearCache(); // Clear cache to force refresh
      }
      return;
    }

    try {
      const response = await apiService.deleteSession(id);
      if (response.error) {
        throw new Error(response.error);
      }
      this.clearCache(); // Clear cache to force refresh
    } catch (error) {
      console.error('Failed to delete session via API:', error);
      throw error;
    }
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiService.healthCheck();
      return !response.error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Method to switch between mock data and API
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    this.clearCache(); // Clear cache when switching modes
  }

  // Method to get current mode
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}

export const dataService = new DataService();
export default dataService;
