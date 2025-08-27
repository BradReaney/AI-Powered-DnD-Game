import { ICharacter, ILocation } from '../models';

export interface DiscoveryMessage {
  type: 'system-discovery';
  content: string;
  metadata: {
    discoveryType: 'character' | 'location';
    entityId: string;
    confidence: number;
    extractionMethod: 'llm' | 'pattern' | 'hybrid';
    entityDetails: ICharacter | ILocation;
    isNew: boolean;
  };
}

export class DiscoveryMessageService {
  /**
   * Clean location names by removing common words and articles
   */
  private cleanLocationName(name: string): string {
    if (!name) return name;

    // Common words to remove from location names
    const wordsToRemove = [
      'its',
      'the',
      'a',
      'an',
      'this',
      'that',
      'these',
      'those',
      'my',
      'your',
      'his',
      'her',
      'their',
      'our',
      'some',
      'any',
      'every',
      'each',
      'all',
      'both',
      'near',
      'at',
      'in',
      'on',
      'by',
      'from',
      'to',
      'of',
    ];

    // Split the name into words
    const words = name.trim().split(/\s+/);

    // Remove common words from the beginning and end
    while (words.length > 0 && wordsToRemove.includes(words[0].toLowerCase())) {
      words.shift();
    }

    while (words.length > 0 && wordsToRemove.includes(words[words.length - 1].toLowerCase())) {
      words.pop();
    }

    // If we have no words left, return the original name
    if (words.length === 0) {
      return name;
    }

    // Capitalize the first letter of each remaining word
    const cleanedWords = words.map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return cleanedWords.join(' ');
  }

  /**
   * Generate discovery messages for newly discovered characters
   */
  generateCharacterDiscoveryMessage(
    character: ICharacter,
    isNew: boolean = true
  ): DiscoveryMessage {
    const personalityTraits = character.personality?.traits?.join(', ') || 'Unknown';
    const background = character.personality?.background || 'No background available';

    // Handle multi-line background with proper indentation
    const backgroundLines = (background || 'No background available').split('\n');
    const formattedBackground =
      backgroundLines.length > 1
        ? backgroundLines.map((line, index) => (index === 0 ? line : `   ${line}`)).join('\n')
        : background;

    const content = `🆕 New Character Discovered: ${character.name}
   • Race: ${character.race || 'Unknown'}
   • Class: ${character.class || 'Unknown'}
   • Level: ${character.level || 1}
   • Personality: ${personalityTraits}
   • Background: ${formattedBackground}`;

    return {
      type: 'system-discovery',
      content,
      metadata: {
        discoveryType: 'character',
        entityId: character._id?.toString() || character.id || '',
        confidence: 85, // Default confidence for LLM extraction
        extractionMethod: 'llm',
        entityDetails: character,
        isNew,
      },
    };
  }

  /**
   * Generate discovery messages for newly discovered locations
   */
  generateLocationDiscoveryMessage(location: ILocation, isNew: boolean = true): DiscoveryMessage {
    // Clean the location name to remove common words
    const cleanedName = this.cleanLocationName(location.name);

    // Handle multi-line description with proper indentation
    const descriptionLines = (location.description || 'Location discovered during adventure').split(
      '\n'
    );
    const formattedDescription =
      descriptionLines.length > 1
        ? descriptionLines.map((line, index) => (index === 0 ? line : `   ${line}`)).join('\n')
        : location.description || 'Location discovered during adventure';

    const poiList =
      location.pointsOfInterest && location.pointsOfInterest.length > 0
        ? location.pointsOfInterest.map(poi => `   • ${poi.name}: ${poi.description}`).join('\n')
        : '   • No specific points of interest identified';

    const content = `🆕 New Location Discovered: ${cleanedName}
   • Type: ${location.type || 'Unknown'}
   • Description: ${formattedDescription}
   • Points of Interest:
${poiList}`;

    return {
      type: 'system-discovery',
      content,
      metadata: {
        discoveryType: 'location',
        entityId: location._id?.toString() || location.id || '',
        confidence: 85, // Default confidence for LLM extraction
        extractionMethod: 'llm',
        entityDetails: location,
        isNew,
      },
    };
  }

  /**
   * Generate discovery messages for multiple entities
   */
  generateDiscoveryMessages(
    characters: ICharacter[],
    locations: ILocation[],
    extractionMethods: { characters: string; locations: string }
  ): DiscoveryMessage[] {
    const messages: DiscoveryMessage[] = [];

    // Generate character discovery messages
    for (const character of characters) {
      const isNew =
        !character.createdAt ||
        new Date().getTime() - new Date(character.createdAt).getTime() < 60000; // Within 1 minute

      const message = this.generateCharacterDiscoveryMessage(character, isNew);
      message.metadata.extractionMethod = this.mapExtractionMethod(extractionMethods.characters);
      message.metadata.confidence = this.calculateConfidence(extractionMethods.characters);
      messages.push(message);
    }

    // Generate location discovery messages
    for (const location of locations) {
      const isNew =
        !location.createdAt ||
        new Date().getTime() - new Date(location.createdAt).getTime() < 60000; // Within 1 minute

      const message = this.generateLocationDiscoveryMessage(location, isNew);
      message.metadata.extractionMethod = this.mapExtractionMethod(extractionMethods.locations);
      message.metadata.confidence = this.calculateConfidence(extractionMethods.locations);
      messages.push(message);
    }

    return messages;
  }

  /**
   * Map extraction method to confidence score
   */
  private calculateConfidence(extractionMethod: string): number {
    switch (extractionMethod) {
      case 'llm_extraction':
        return 85;
      case 'fallback_extraction':
        return 65;
      case 'hybrid_extraction':
        return 75;
      default:
        return 70;
    }
  }

  /**
   * Map extraction method string to enum value
   */
  private mapExtractionMethod(extractionMethod: string): 'llm' | 'pattern' | 'hybrid' {
    switch (extractionMethod) {
      case 'llm_extraction':
        return 'llm';
      case 'fallback_extraction':
        return 'pattern';
      case 'hybrid_extraction':
        return 'hybrid';
      default:
        return 'llm';
    }
  }

  /**
   * Generate a discovery summary message
   */
  generateDiscoverySummaryMessage(characterCount: number, locationCount: number): DiscoveryMessage {
    const content = `📊 **Discovery Summary**
   • Characters Discovered: ${characterCount}
   • Locations Discovered: ${locationCount}
   • Total New Entities: ${characterCount + locationCount}`;

    return {
      type: 'system-discovery',
      content,
      metadata: {
        discoveryType: 'character', // Use character as default for summary
        entityId: 'summary',
        confidence: 100,
        extractionMethod: 'hybrid',
        entityDetails: {} as any, // Empty for summary
        isNew: false,
      },
    };
  }
}

export default DiscoveryMessageService;
