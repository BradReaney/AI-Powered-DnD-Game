import leven from 'leven';
import logger from './LoggerService';

export interface CharacterNameMatch {
  existingCharacter: any;
  similarityScore: number;
  confidence: number;
  isMatch: boolean;
}

export class CharacterNameSimilarityService {
  private static instance: CharacterNameSimilarityService;

  // Default confidence threshold - can be configured via environment variable
  private confidenceThreshold: number;

  // Minimum similarity score to consider names as potentially matching
  private minSimilarityScore: number;

  // Maximum edit distance for short names
  private maxEditDistanceShort: number;

  // Maximum edit distance for long names
  private maxEditDistanceLong: number;

  private constructor() {
    this.confidenceThreshold = parseInt(
      process.env.CHARACTER_SIMILARITY_CONFIDENCE_THRESHOLD || '70'
    );
    this.minSimilarityScore = parseInt(process.env.CHARACTER_SIMILARITY_MIN_SCORE || '60');
    this.maxEditDistanceShort = parseInt(
      process.env.CHARACTER_SIMILARITY_MAX_EDIT_DISTANCE_SHORT || '2'
    );
    this.maxEditDistanceLong = parseInt(
      process.env.CHARACTER_SIMILARITY_MAX_EDIT_DISTANCE_LONG || '3'
    );
  }

  public static getInstance(): CharacterNameSimilarityService {
    if (!CharacterNameSimilarityService.instance) {
      CharacterNameSimilarityService.instance = new CharacterNameSimilarityService();
    }
    return CharacterNameSimilarityService.instance;
  }

  /**
   * Find the best matching character by name similarity
   * @param newCharacterName The name of the new character to match
   * @param existingCharacters Array of existing characters to compare against
   * @returns CharacterNameMatch object with match details
   */
  public findBestNameMatch(
    newCharacterName: string,
    existingCharacters: any[]
  ): CharacterNameMatch | null {
    if (!newCharacterName || existingCharacters.length === 0) {
      return null;
    }

    let bestMatch: CharacterNameMatch | null = null;
    let highestConfidence = 0;

    for (const existingCharacter of existingCharacters) {
      const match = this.areNamesTheSamePerson(newCharacterName, existingCharacter.name);

      if (match.isMatch && match.confidence > highestConfidence) {
        highestConfidence = match.confidence;
        bestMatch = {
          existingCharacter,
          similarityScore: match.similarityScore,
          confidence: match.confidence,
          isMatch: match.isMatch,
        };
      }
    }

    // Only return a match if confidence is above the threshold
    return bestMatch && bestMatch.confidence >= this.confidenceThreshold ? bestMatch : null;
  }

  /**
   * Calculate similarity score between two character names
   * @param name1 First character name
   * @param name2 Second character name
   * @returns Similarity score (0-100)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    if (!name1 || !name2) {
      return 0;
    }

    // Normalize names for comparison
    const normalizedName1 = this.normalizeName(name1);
    const normalizedName2 = this.normalizeName(name2);

    // Exact match after normalization
    if (normalizedName1 === normalizedName2) {
      return 100;
    }

    // Handle cases where one name is much shorter than the other
    // This helps with cases like "The old man" -> "Finnan"
    if (normalizedName1.length === 0 || normalizedName2.length === 0) {
      return 0;
    }

    // Calculate edit distance
    const editDistance = leven(normalizedName1, normalizedName2);
    const maxLength = Math.max(normalizedName1.length, normalizedName2.length);

    // Calculate similarity percentage based on edit distance
    let similarity = Math.max(0, 100 - (editDistance / maxLength) * 100);

    // Boost similarity for cases where one name is contained within the other
    if (normalizedName1.includes(normalizedName2) || normalizedName2.includes(normalizedName1)) {
      similarity = Math.min(100, similarity + 25);
    }

    // Boost similarity for cases where names are very different lengths but share words
    if (Math.abs(normalizedName1.length - normalizedName2.length) > 5) {
      const words1 = normalizedName1.split(' ').filter(w => w.length > 2);
      const words2 = normalizedName2.split(' ').filter(w => w.length > 2);
      const commonWords = words1.filter(w => words2.includes(w));

      if (commonWords.length > 0) {
        similarity = Math.min(100, similarity + commonWords.length * 15);
      }
    }

    // Apply additional scoring for common patterns
    const patternBonus = this.calculatePatternBonus(normalizedName1, normalizedName2);

    return Math.min(100, similarity + patternBonus);
  }

  /**
   * Check if two character names represent progressive identification
   * This handles cases like "The old man" -> "Old Finnan" -> "Finnan"
   * @param name1 First character name
   * @param name2 Second character name
   * @returns Object with match details for progressive identification
   */
  public checkProgressiveIdentification(
    name1: string,
    name2: string
  ): {
    isProgressiveMatch: boolean;
    confidence: number;
    progressionType: 'generic_to_specific' | 'specific_to_generic' | 'none';
    reason: string;
  } {
    const normalizedName1 = this.normalizeName(name1);
    const normalizedName2 = this.normalizeName(name2);

    // Simple heuristic: if one name is very short (likely a specific name) and the other is longer (likely generic)
    const isShort1 = normalizedName1.length <= 6; // Very short names (like "Finnan")
    const isShort2 = normalizedName2.length <= 6;
    const isMedium1 = normalizedName1.length > 6 && normalizedName1.length <= 10; // Medium names (like "old man")
    const isMedium2 = normalizedName2.length > 6 && normalizedName2.length <= 10;
    const isLong1 = normalizedName1.length > 10; // Long names
    const isLong2 = normalizedName2.length > 10;

    // Check for generic patterns in the longer name
    const genericWords = [
      'old',
      'young',
      'elder',
      'younger',
      'mysterious',
      'strange',
      'tall',
      'short',
      'fat',
      'thin',
      'beautiful',
      'ugly',
      'wise',
      'foolish',
      'brave',
      'cowardly',
      'man',
      'woman',
      'person',
      'figure',
      'stranger',
      'wizard',
      'warrior',
      'merchant',
      'traveler',
      'peasant',
      'noble',
      'guard',
      'soldier',
      'knight',
      'mage',
      'rogue',
      'cleric',
      'fighter',
      'ranger',
      'paladin',
      'barbarian',
      'monk',
      'druid',
      'sorcerer',
      'warlock',
      'bard',
      'artificer',
    ];

    const hasGenericWords1 = genericWords.some(word =>
      normalizedName1.toLowerCase().includes(word)
    );
    const hasGenericWords2 = genericWords.some(word =>
      normalizedName2.toLowerCase().includes(word)
    );

    // If one is generic (medium/long with generic words) and the other is specific (short without generic words)
    if (hasGenericWords1 && !hasGenericWords2 && (isMedium1 || isLong1) && isShort2) {
      const progressionConfidence = this.calculateProgressionConfidence(
        normalizedName1,
        normalizedName2,
        'generic_to_specific'
      );

      return {
        isProgressiveMatch: progressionConfidence >= this.confidenceThreshold,
        confidence: progressionConfidence,
        progressionType: 'generic_to_specific',
        reason: `Generic description "${name1}" progresses to specific name "${name2}"`,
      };
    } else if (!hasGenericWords1 && hasGenericWords2 && isShort1 && (isMedium2 || isLong2)) {
      const progressionConfidence = this.calculateProgressionConfidence(
        normalizedName2,
        normalizedName1,
        'generic_to_specific'
      );

      return {
        isProgressiveMatch: progressionConfidence >= this.confidenceThreshold,
        confidence: progressionConfidence,
        progressionType: 'specific_to_generic',
        reason: `Specific name "${name1}" referenced as generic description "${name2}"`,
      };
    }

    return {
      isProgressiveMatch: false,
      confidence: 0,
      progressionType: 'none',
      reason: 'Neither name is generic or both are generic',
    };
  }

  /**
   * Calculate confidence for progressive identification
   * @param genericDescription The generic description (like "old man")
   * @param specificName The specific name (like "finnan")
   * @param direction The direction of progression
   * @returns Confidence score (0-100)
   */
  private calculateProgressionConfidence(
    genericDescription: string,
    specificName: string,
    direction: 'generic_to_specific' | 'specific_to_generic'
  ): number {
    let confidence = 0;

    // Check if the generic description contains any words that might relate to the specific name
    const genericWords = genericDescription.split(' ').filter(w => w.length > 2);
    const specificWords = specificName.split(' ').filter(w => w.length > 2);

    // Look for any word overlap
    const commonWords = genericWords.filter(w => specificWords.includes(w));
    if (commonWords.length > 0) {
      confidence += 20;
    }

    // Check for contextual clues
    // If generic description mentions "old" and specific name is short (like "Finnan"),
    // this could indicate an elderly character
    if (genericDescription.toLowerCase().includes('old') && specificName.length <= 6) {
      confidence += 25; // Increased confidence for this specific case
    }

    // If generic description mentions a class/profession and specific name is short,
    // this could be a character being identified by their role
    const classWords = [
      'wizard',
      'warrior',
      'mage',
      'rogue',
      'cleric',
      'fighter',
      'ranger',
      'paladin',
      'barbarian',
      'monk',
      'druid',
      'sorcerer',
      'warlock',
      'bard',
      'artificer',
    ];
    const hasClass = classWords.some(word => genericDescription.toLowerCase().includes(word));
    if (hasClass && specificName.length <= 8) {
      confidence += 15;
    }

    // Boost confidence for very short specific names (like "Finnan", "Gandalf", "Aragorn")
    // as these are likely to be referenced by generic descriptions
    if (specificName.length <= 6) {
      confidence += 20; // Increased confidence for short names
    }

    // Check for common naming patterns that suggest progression
    // e.g., "Old Finnan" -> "Finnan" (removing descriptor)
    if (direction === 'generic_to_specific') {
      if (
        genericDescription.toLowerCase().includes(specificName.toLowerCase()) ||
        specificName.toLowerCase().includes(genericDescription.toLowerCase())
      ) {
        confidence += 30;
      }
    }

    // Special case: "The old man" -> "Finnan" (very generic to very specific)
    if (
      genericDescription.toLowerCase().includes('old') &&
      genericDescription.toLowerCase().includes('man') &&
      specificName.length <= 6
    ) {
      confidence += 35; // High confidence for this specific pattern
    }

    return Math.min(100, confidence);
  }

  /**
   * Normalize character names for better comparison
   * @param name Character name to normalize
   * @returns Normalized name
   */
  private normalizeName(name: string): string {
    if (!name) return '';

    return (
      name
        .toLowerCase()
        .trim()
        // Remove common articles and titles
        .replace(/^(the|a|an|old|young|elder|younger)\s+/i, '')
        // Remove common suffixes
        .replace(
          /\s+(the\s+)?(wizard|warrior|mage|rogue|cleric|fighter|ranger|paladin|barbarian|monk|druid|sorcerer|warlock|bard|artificer)$/i,
          ''
        )
        // Remove punctuation
        .replace(/[^\w\s]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Calculate bonus points for common naming patterns
   * @param name1 First normalized name
   * @param name2 Second normalized name
   * @returns Bonus points (0-20)
   */
  private calculatePatternBonus(name1: string, name2: string): number {
    let bonus = 0;

    // Check for common prefixes
    const words1 = name1.split(' ');
    const words2 = name2.split(' ');

    // Bonus for matching first words (first names)
    if (words1[0] && words2[0] && words1[0] === words2[0]) {
      bonus += 10;
    }

    // Bonus for matching last words (last names)
    if (
      words1.length > 1 &&
      words2.length > 1 &&
      words1[words1.length - 1] === words2[words2.length - 1]
    ) {
      bonus += 10;
    }

    // Bonus for partial matches
    if (name1.includes(name2) || name2.includes(name1)) {
      bonus += 15;
    }

    return Math.min(20, bonus);
  }

  /**
   * Calculate confidence level for a similarity match
   * @param similarityScore Raw similarity score
   * @param _name1 First character name (unused but kept for future extensibility)
   * @param _name2 Second character name (unused but kept for future extensibility)
   * @returns Confidence percentage (0-100)
   */
  private calculateConfidence(similarityScore: number, _name1: string, _name2: string): number {
    if (similarityScore >= 95) {
      return 100; // Very high confidence for near-exact matches
    }

    if (similarityScore >= 85) {
      return 90; // High confidence
    }

    if (similarityScore >= 75) {
      return 80; // Medium-high confidence
    }

    if (similarityScore >= 65) {
      return 75; // Medium confidence
    }

    if (similarityScore >= 55) {
      return 70; // Lower medium confidence
    }

    if (similarityScore >= 45) {
      return 65; // Low confidence but still above threshold
    }

    // Lower confidence for lower scores
    return Math.max(0, similarityScore - 5);
  }

  /**
   * Check if two character names should be considered the same person
   * @param name1 First character name
   * @param name2 Second character name
   * @returns Object with match details
   */
  public areNamesTheSamePerson(
    name1: string,
    name2: string
  ): {
    isMatch: boolean;
    similarityScore: number;
    confidence: number;
    matchType: 'exact' | 'similarity' | 'progressive' | 'none';
    reason: string;
  } {
    // First check for exact match
    if (name1.toLowerCase().trim() === name2.toLowerCase().trim()) {
      return {
        isMatch: true,
        similarityScore: 100,
        confidence: 100,
        matchType: 'exact',
        reason: 'Exact name match',
      };
    }

    // Check for progressive identification (generic -> specific or vice versa)
    const progressiveCheck = this.checkProgressiveIdentification(name1, name2);
    if (progressiveCheck.isProgressiveMatch) {
      return {
        isMatch: true,
        similarityScore: progressiveCheck.confidence,
        confidence: progressiveCheck.confidence,
        matchType: 'progressive',
        reason: progressiveCheck.reason,
      };
    }

    // Fall back to similarity-based matching
    const similarityScore = this.calculateNameSimilarity(name1, name2);
    const confidence = this.calculateConfidence(similarityScore, name1, name2);
    const isMatch = confidence >= this.confidenceThreshold;

    return {
      isMatch,
      similarityScore,
      confidence,
      matchType: isMatch ? 'similarity' : 'none',
      reason: isMatch ? `Similarity match with ${confidence}% confidence` : 'No match found',
    };
  }

  /**
   * Get configuration for debugging
   * @returns Current configuration
   */
  public getConfig(): any {
    return {
      confidenceThreshold: this.confidenceThreshold,
      minSimilarityScore: this.minSimilarityScore,
      maxEditDistanceShort: this.maxEditDistanceShort,
      maxEditDistanceLong: this.maxEditDistanceLong,
    };
  }

  /**
   * Update configuration (useful for testing)
   * @param config New configuration values
   */
  public updateConfig(
    config: Partial<{
      confidenceThreshold: number;
      minSimilarityScore: number;
      maxEditDistanceShort: number;
      maxEditDistanceLong: number;
    }>
  ): void {
    if (config.confidenceThreshold !== undefined) {
      this.confidenceThreshold = config.confidenceThreshold;
    }
    if (config.minSimilarityScore !== undefined) {
      this.minSimilarityScore = config.minSimilarityScore;
    }
    if (config.maxEditDistanceShort !== undefined) {
      this.maxEditDistanceShort = config.maxEditDistanceShort;
    }
    if (config.maxEditDistanceLong !== undefined) {
      this.maxEditDistanceLong = config.maxEditDistanceLong;
    }

    logger.info('CharacterNameSimilarityService configuration updated', this.getConfig());
  }
}

export default CharacterNameSimilarityService;
