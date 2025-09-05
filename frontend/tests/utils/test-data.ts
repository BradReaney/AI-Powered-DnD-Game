/**
 * Test data utilities for the AI-Powered D&D Game
 * Provides unique test data generation and cleanup utilities
 */

export class TestDataGenerator {
  private static counter = 0;

  /**
   * Generate a unique campaign name for testing
   */
  static generateCampaignName(): string {
    this.counter++;
    return `Test Campaign ${this.counter} - ${Date.now()}`;
  }

  /**
   * Generate a unique character name for testing
   */
  static generateCharacterName(): string {
    this.counter++;
    return `Test Hero ${this.counter} - ${Date.now()}`;
  }

  /**
   * Generate a unique location name for testing
   */
  static generateLocationName(): string {
    this.counter++;
    return `Test Location ${this.counter} - ${Date.now()}`;
  }

  /**
   * Generate test campaign data
   */
  static generateCampaignData() {
    return {
      name: this.generateCampaignName(),
      description: `A test campaign created at ${new Date().toISOString()}`,
      theme: "fantasy",
      status: "active" as const,
      createdBy: "player",
    };
  }

  /**
   * Generate test character data
   */
  static generateCharacterData() {
    return {
      name: this.generateCharacterName(),
      race: "Human",
      class: "Fighter",
      level: 1,
      background: "Soldier",
      alignment: "Lawful Good",
    };
  }

  /**
   * Generate test location data
   */
  static generateLocationData() {
    return {
      name: this.generateLocationName(),
      type: "town",
      description: `A test location created at ${new Date().toISOString()}`,
      discovered: true,
      visited: false,
    };
  }

  /**
   * Reset the counter (useful for test cleanup)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}

/**
 * Test cleanup utilities
 */
export class TestCleanup {
  /**
   * Clean up test data by removing items with test prefixes
   */
  static async cleanupTestData(apiService: any) {
    try {
      // This would need to be implemented based on your API structure
      // For now, it's a placeholder for the cleanup logic
      console.log("Test data cleanup would be implemented here");
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  }
}

/**
 * Test selectors - centralized location for all test selectors
 */
export const TestSelectors = {
  // Campaign form selectors
  campaign: {
    name: '[data-testid="campaign-name"]',
    description: '[data-testid="campaign-description"]',
    theme: '[data-testid="campaign-theme"]',
    createButton: 'button:has-text("Create Campaign")',
    editButton: 'button:has-text("Edit Campaign")',
  },

  // Character form selectors
  character: {
    name: '[data-testid="character-name"]',
    race: '[data-testid="character-race"]',
    class: '[data-testid="character-class"]',
    level: '[data-testid="character-level"]',
    createButton: 'button:has-text("Create Character")',
    editButton: 'button:has-text("Edit Character")',
  },

  // Navigation selectors
  navigation: {
    campaignsTab: '[role="tab"]:has-text("Campaigns")',
    charactersTab: '[role="tab"]:has-text("Characters")',
    playTab: '[role="tab"]:has-text("Play")',
    newCampaignButton: 'button:has-text("New Campaign")',
    createCharacterButton: 'button:has-text("Create Character")',
  },

  // Common selectors
  common: {
    loadingSpinner: '[data-testid="loading-spinner"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
  },
} as const;

/**
 * Test constants
 */
export const TestConstants = {
  timeouts: {
    short: 2000,
    medium: 5000,
    long: 10000,
    veryLong: 30000,
  },

  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },
} as const;
