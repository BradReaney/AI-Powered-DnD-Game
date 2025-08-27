import logger from './LoggerService';
import { Location, ILocation } from '../models';
import LLMClientFactory from './LLMClientFactory';
import { cacheService } from './CacheService';

export interface LocationCreationData {
  name: string;
  description: string;
  type:
    | 'settlement'
    | 'dungeon'
    | 'wilderness'
    | 'landmark'
    | 'shop'
    | 'tavern'
    | 'temple'
    | 'castle'
    | 'other';
  campaignId: string;
  sessionId?: string;
  discoveredBy: string[];
  coordinates?: {
    x: number;
    y: number;
    region: string;
  };
  importance?: 'minor' | 'moderate' | 'major' | 'critical';
  tags?: string[];
  notes?: string;
  createdBy: string;
}

export interface ExtractedLocationData {
  name: string;
  description: string;
  type:
    | 'settlement'
    | 'dungeon'
    | 'wilderness'
    | 'landmark'
    | 'shop'
    | 'tavern'
    | 'temple'
    | 'castle'
    | 'other';
  importance?: 'minor' | 'moderate' | 'major' | 'critical';
  tags?: string[];
  coordinates?: {
    x: number;
    y: number;
    region: string;
  };
  climate?: string;
  terrain?: string;
  lighting?: string;
  weather?: string;
  resources?: string[];
  pointsOfInterest?: Array<{
    name: string;
    description: string;
    type: string;
    isExplored: boolean;
  }>;
}

export interface LocationUpdateData {
  name?: string;
  description?: string;
  type?:
    | 'settlement'
    | 'dungeon'
    | 'wilderness'
    | 'landmark'
    | 'shop'
    | 'tavern'
    | 'temple'
    | 'castle'
    | 'other';
  coordinates?: {
    x: number;
    y: number;
    region: string;
  };
  isExplored?: boolean;
  isSafe?: boolean;
  importance?: 'minor' | 'moderate' | 'major' | 'critical';
  tags?: string[];
  notes?: string;
  climate?: string;
  terrain?: string;
  lighting?: string;
  weather?: string;
  resources?: string[];
  pointsOfInterest?: Array<{
    name: string;
    description: string;
    type: string;
    isExplored: boolean;
  }>;
}

export class LocationService {
  private geminiClient: any;

  constructor() {
    this.geminiClient = LLMClientFactory.getInstance().getClient();
  }

  /**
   * Create a new location
   */
  async createLocation(data: LocationCreationData): Promise<ILocation> {
    try {
      const location = new Location(data);
      const savedLocation = await location.save();

      logger.info('Location created successfully', {
        locationId: savedLocation._id,
        name: savedLocation.name,
        campaignId: savedLocation.campaignId,
        sessionId: savedLocation.sessionId,
      });

      return savedLocation;
    } catch (error) {
      logger.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Get a location by ID
   */
  async getLocationById(locationId: string): Promise<ILocation | null> {
    try {
      // Try to get from cache first
      const cacheKey = `location:${locationId}`;
      const cached = await cacheService.get<ILocation>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for location: ${locationId}`);
        return cached;
      }

      // If not in cache, get from database
      const location = await Location.findById(locationId);

      if (location) {
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, location, { ttl: 300 });
        logger.debug(`Cached location: ${locationId}`);
      }

      return location;
    } catch (error) {
      logger.error('Error getting location by ID:', error);
      throw error;
    }
  }

  /**
   * Get a location by name within a campaign
   */
  async getLocationByName(name: string, campaignId: string): Promise<ILocation | null> {
    try {
      // Try to get from cache first
      const cacheKey = `location:name:${name}:campaign:${campaignId}`;
      const cached = await cacheService.get<ILocation>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for location by name: ${name} in campaign: ${campaignId}`);
        return cached;
      }

      // If not in cache, get from database
      const location = await Location.findOne({ name, campaignId });

      if (location) {
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, location, { ttl: 300 });
        logger.debug(`Cached location by name: ${name} in campaign: ${campaignId}`);
      }

      return location;
    } catch (error) {
      logger.error('Error getting location by name:', error);
      throw error;
    }
  }

  /**
   * Get all locations for a campaign
   */
  async getCampaignLocations(
    campaignId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ILocation[]> {
    try {
      // Try to get from cache first
      const cacheKey = `locations:campaign:${campaignId}:${limit}:${offset}`;
      const cached = await cacheService.get<ILocation[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for campaign locations: ${campaignId}`);
        return cached;
      }

      // If not in cache, get from database
      const locations = await Location.find({ campaignId })
        .sort({ lastVisited: -1 })
        .skip(offset)
        .limit(limit);

      // Cache the result for 3 minutes
      await cacheService.set(cacheKey, locations, { ttl: 180 });
      logger.debug(`Cached campaign locations: ${campaignId}`);

      return locations;
    } catch (error) {
      logger.error('Error getting campaign locations:', error);
      throw error;
    }
  }

  /**
   * Get all locations for a session
   */
  async getSessionLocations(
    sessionId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ILocation[]> {
    try {
      // Try to get from cache first
      const cacheKey = `locations:session:${sessionId}:${limit}:${offset}`;
      const cached = await cacheService.get<ILocation[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for session locations: ${sessionId}`);
        return cached;
      }

      // If not in cache, get from database
      const locations = await Location.find({ sessionId })
        .sort({ lastVisited: -1 })
        .skip(offset)
        .limit(limit);

      // Cache the result for 3 minutes
      await cacheService.set(cacheKey, locations, { ttl: 180 });
      logger.debug(`Cached session locations: ${sessionId}`);

      return locations;
    } catch (error) {
      logger.error('Error getting session locations:', error);
      throw error;
    }
  }

  /**
   * Update a location
   */
  async updateLocation(
    locationId: string,
    updateData: LocationUpdateData
  ): Promise<ILocation | null> {
    try {
      const updatedLocation = await Location.findByIdAndUpdate(
        locationId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (updatedLocation) {
        // Invalidate related cache
        await this.invalidateLocationCache(
          locationId,
          updatedLocation.campaignId.toString(),
          updatedLocation.sessionId?.toString()
        );

        logger.info('Location updated successfully', {
          locationId: updatedLocation._id,
          name: updatedLocation.name,
        });
      }

      return updatedLocation;
    } catch (error) {
      logger.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Mark a location as visited by a character
   */
  async markLocationAsVisited(
    locationId: string,
    characterName: string
  ): Promise<ILocation | null> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      // Update last visited timestamp and visit count
      location.lastVisited = new Date();
      location.visitCount = (location.visitCount || 0) + 1;

      // Add to discovered by if not already there
      if (!location.discoveredBy.includes(characterName)) {
        location.discoveredBy.push(characterName);
      }

      await location.save();

      // Invalidate related cache
      await this.invalidateLocationCache(
        locationId,
        location.campaignId.toString(),
        location.sessionId?.toString()
      );

      logger.info(`Location ${location.name} marked as visited by ${characterName}`);
      return location;
    } catch (error) {
      logger.error('Error marking location as visited:', error);
      throw error;
    }
  }

  // Private method to invalidate location-related cache
  private async invalidateLocationCache(
    locationId: string,
    campaignId: string,
    sessionId?: string
  ): Promise<void> {
    try {
      const patterns = [
        `location:${locationId}`,
        `location:name:*:campaign:${campaignId}`,
        `locations:campaign:${campaignId}:*`,
      ];

      if (sessionId) {
        patterns.push(`locations:session:${sessionId}:*`);
      }

      for (const pattern of patterns) {
        await cacheService.deletePattern(pattern);
      }

      logger.debug(`Cache invalidated for location: ${locationId}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache for location ${locationId}:`, error);
    }
  }

  /**
   * Add a character to a location's current occupants
   */
  async addOccupantToLocation(
    locationId: string,
    characterName: string
  ): Promise<ILocation | null> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      await location.addOccupant(characterName);
      return location;
    } catch (error) {
      logger.error('Error adding occupant to location:', error);
      throw error;
    }
  }

  /**
   * Remove a character from a location's current occupants
   */
  async removeOccupantFromLocation(
    locationId: string,
    characterName: string
  ): Promise<ILocation | null> {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      await location.removeOccupant(characterName);
      return location;
    } catch (error) {
      logger.error('Error removing occupant from location:', error);
      throw error;
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(locationId: string): Promise<boolean> {
    try {
      const result = await Location.findByIdAndDelete(locationId);
      if (result) {
        logger.info('Location deleted successfully', {
          locationId: result._id,
          name: result.name,
        });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting location:', error);
      throw error;
    }
  }

  /**
   * Extract location information from chat content using LLM
   */
  async extractLocationInformationFromChat(
    chatContent: string,
    originalPrompt: string
  ): Promise<ExtractedLocationData[]> {
    try {
      const response = await this.geminiClient.extractLocationInformation(
        chatContent,
        originalPrompt
      );

      if (!response.success) {
        logger.warn('Location extraction failed:', response.error);
        return [];
      }

      try {
        // Try to parse the JSON response
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const locationsData = JSON.parse(jsonMatch[0]);
          logger.info('Location extraction successful', {
            locationCount: locationsData.length,
            locationNames: locationsData.map((l: any) => l.name),
          });
          return locationsData;
        } else {
          logger.warn('No JSON array found in location extraction response');
          return [];
        }
      } catch (parseError) {
        logger.warn('Failed to parse location extraction JSON:', parseError);
        return [];
      }
    } catch (error) {
      logger.error('Error during location extraction:', error);
      return [];
    }
  }

  /**
   * Get current location for a character
   */
  async getCharacterCurrentLocation(
    characterName: string,
    campaignId: string
  ): Promise<ILocation | null> {
    try {
      // Find locations where the character is currently an occupant
      const location = await Location.findOne({
        campaignId,
        currentOccupants: characterName,
      });

      return location;
    } catch (error) {
      logger.error('Error getting character current location:', error);
      throw error;
    }
  }

  /**
   * Get location history for a character
   */
  async getCharacterLocationHistory(
    characterName: string,
    campaignId: string,
    limit: number = 20
  ): Promise<ILocation[]> {
    try {
      // Find locations discovered by the character, ordered by discovery date
      const locations = await Location.find({
        campaignId,
        discoveredBy: characterName,
      })
        .sort({ discoveredAt: -1 })
        .limit(limit);

      return locations;
    } catch (error) {
      logger.error('Error getting character location history:', error);
      throw error;
    }
  }

  /**
   * Search locations by various criteria
   */
  async searchLocations(
    campaignId: string,
    searchCriteria: {
      name?: string;
      type?: string;
      importance?: string;
      tags?: string[];
      isExplored?: boolean;
      isSafe?: boolean;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<ILocation[]> {
    try {
      const query: any = { campaignId };

      if (searchCriteria.name) {
        query.name = { $regex: searchCriteria.name, $options: 'i' };
      }

      if (searchCriteria.type) {
        query.type = searchCriteria.type;
      }

      if (searchCriteria.importance) {
        query.importance = searchCriteria.importance;
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        query.tags = { $in: searchCriteria.tags };
      }

      if (searchCriteria.isExplored !== undefined) {
        query.isExplored = searchCriteria.isExplored;
      }

      if (searchCriteria.isSafe !== undefined) {
        query.isSafe = searchCriteria.isSafe;
      }

      return await Location.find(query).sort({ lastVisited: -1 }).skip(offset).limit(limit);
    } catch (error) {
      logger.error('Error searching locations:', error);
      throw error;
    }
  }
}

export default LocationService;
