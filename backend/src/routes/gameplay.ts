import express from 'express';
import SkillCheckService from '../services/SkillCheckService';
import ContextManager from '../services/ContextManager';
import LLMClientFactory from '../services/LLMClientFactory';
import PromptService from '../services/PromptService';
import logger from '../services/LoggerService';

const router = express.Router();
const skillCheckService = new SkillCheckService();
const contextManager = new ContextManager();
const geminiClient = LLMClientFactory.getInstance().getClient();
const promptService = new PromptService();

// Perform a skill check
router.post('/skill-check', async (req, res) => {
  try {
    const {
      characterId,
      skillName,
      d20Roll,
      targetDC,
      actionDescription,
      campaignId,
      sessionId,
      location,
      advantage,
      disadvantage,
      customModifiers,
    } = req.body;

    // Validate required fields
    if (
      !characterId ||
      !skillName ||
      !d20Roll ||
      !targetDC ||
      !actionDescription ||
      !campaignId ||
      !sessionId ||
      !location
    ) {
      return res.status(400).json({
        error:
          'Missing required fields: characterId, skillName, d20Roll, targetDC, actionDescription, campaignId, sessionId, location',
      });
    }

    // Validate d20 roll
    if (d20Roll < 1 || d20Roll > 20) {
      return res.status(400).json({ error: 'D20 roll must be between 1 and 20' });
    }

    // Validate target DC
    if (targetDC < 1 || targetDC > 30) {
      return res.status(400).json({ error: 'Target DC must be between 1 and 30' });
    }

    const skillCheckRequest = {
      characterId,
      skillName,
      d20Roll,
      targetDC,
      actionDescription,
      campaignId,
      sessionId,
      location,
      advantage,
      disadvantage,
      customModifiers,
    };

    // Perform the skill check
    const result = await skillCheckService.performSkillCheck(skillCheckRequest);

    // Add context for the AI
    contextManager.addContextLayer(
      campaignId,
      'immediate',
      `Skill check performed: ${skillName} check for "${actionDescription}". Result: ${result.totalResult} vs DC ${targetDC}. ${result.success ? 'Success' : 'Failure'}${result.critical ? ' (Critical!)' : ''}.`,
      result.critical ? 9 : result.success ? 7 : 5
    );

    // Generate AI response for the skill check result
    let aiResponse = '';
    try {
      const promptRequest = {
        templateId: 'skill_check_result',
        variables: {
          skillName: result.skillInfo.skillName,
          rollResult: result.totalResult,
          targetDC: targetDC,
          actionDescription: actionDescription,
          context: `Location: ${location}`,
          characterName: characterId, // Could be enhanced to get actual character name
          success: result.success ? 'true' : 'false',
          critical: result.critical ? 'true' : 'false',
        },
      };

      const prompt = promptService.buildPrompt(promptRequest);
      const geminiResponse = await geminiClient.sendPrompt({ prompt });

      if (geminiResponse.success) {
        aiResponse = geminiResponse.content;
      } else {
        aiResponse = `The ${skillName} check ${result.success ? 'succeeds' : 'fails'} with a result of ${result.totalResult}. ${result.consequences.join(' ')}`;
      }
    } catch (error) {
      logger.error('Error generating AI response for skill check:', error);
      aiResponse = `The ${skillName} check ${result.success ? 'succeeds' : 'fails'} with a result of ${result.totalResult}. ${result.consequences.join(' ')}`;
    }

    // Add AI response to context
    contextManager.addContextLayer(campaignId, 'immediate', `AI Response: ${aiResponse}`, 6);

    // Return the skill check result with AI response
    return res.json({
      ...result,
      aiResponse,
    });
  } catch (error) {
    logger.error('Error performing skill check:', error);
    return res.status(500).json({ error: 'Failed to perform skill check' });
  }
});

// Get skill check history for a character
router.get('/skill-check/history/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { skillName } = req.query;

    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    const history = await skillCheckService.getSkillCheckHistory(characterId, skillName as string);

    return res.json({
      success: true,
      history,
      message: 'Skill check history retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting skill check history:', error);
    return res.status(500).json({
      error: 'Failed to get skill check history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get suggested difficulty class for a skill check
router.get('/skill-check/suggested-dc/:skillName', async (req, res) => {
  try {
    const { skillName } = req.params;
    const { difficulty } = req.query;

    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'veryHard'];
    const requestedDifficulty = (difficulty as string) || 'medium';

    if (!validDifficulties.includes(requestedDifficulty)) {
      return res.status(400).json({
        error: 'Invalid difficulty. Must be one of: easy, medium, hard, veryHard',
      });
    }

    const suggestedDC = skillCheckService.getSuggestedDC(skillName, requestedDifficulty as any);

    return res.json({
      success: true,
      skillName,
      difficulty: requestedDifficulty,
      suggestedDC,
      message: 'Suggested DC retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting suggested DC:', error);
    return res.status(500).json({
      error: 'Failed to get suggested DC',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all available skills
router.get('/skills', async (_req, res) => {
  try {
    const skills = skillCheckService.getAllSkills();

    return res.json({
      success: true,
      skills,
      count: skills.length,
      message: 'Skills retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting skills:', error);
    return res.status(500).json({
      error: 'Failed to get skills',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get skill information
router.get('/skills/:skillName', async (req, res) => {
  try {
    const { skillName } = req.params;

    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const abilityScore = skillCheckService.getSkillAbilityScore(skillName);
    const suggestedDCs = {
      easy: skillCheckService.getSuggestedDC(skillName, 'easy'),
      medium: skillCheckService.getSuggestedDC(skillName, 'medium'),
      hard: skillCheckService.getSuggestedDC(skillName, 'hard'),
      veryHard: skillCheckService.getSuggestedDC(skillName, 'veryHard'),
    };

    return res.json({
      success: true,
      skillName,
      abilityScore,
      suggestedDCs,
      message: 'Skill information retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting skill information:', error);
    return res.status(500).json({
      error: 'Failed to get skill information',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Generate AI story response
router.post('/story-response', async (req, res) => {
  try {
    const { playerAction, campaignId, characterContext, worldState, sessionId } = req.body;

    // Validate required fields
    if (!playerAction || !campaignId) {
      return res.status(400).json({
        error: 'Missing required fields: playerAction, campaignId',
      });
    }

    // Get campaign context
    const campaignContext = await contextManager.getContext(campaignId);

    // Generate AI response
    const response = await geminiClient.generateStoryResponse(
      playerAction,
      campaignContext,
      characterContext || 'Character context not available',
      worldState || 'World state not available'
    );

    if (!response.success) {
      return res.status(500).json({
        error: 'Failed to generate AI response',
        details: response.error,
      });
    }

    // Save the player message to the database if sessionId is provided
    let userMessageId = null;
    if (sessionId) {
      try {
        const { Message: MessageModel } = await import('../models');
        const userMessage = new MessageModel({
          sessionId,
          campaignId,
          type: 'player',
          sender: 'You',
          content: playerAction,
          timestamp: new Date(),
          metadata: {
            aiResponse: false,
            originalMessage: playerAction,
          },
        });
        await userMessage.save();
        userMessageId = userMessage._id;
      } catch (saveError) {
        logger.warn('Failed to save player message to database:', saveError);
        // Continue with the response even if saving fails
      }
    }

    // Save the AI response to the database if sessionId is provided
    let aiMessageId = null;
    if (sessionId) {
      try {
        const { Message: MessageModel } = await import('../models');
        const aiMessage = new MessageModel({
          sessionId,
          campaignId,
          type: 'ai',
          sender: 'AI Game Master',
          content: response.content,
          timestamp: new Date(),
          metadata: {
            aiResponse: true,
            originalMessage: playerAction,
            usage: response.usage,
          },
        });
        await aiMessage.save();
        aiMessageId = aiMessage._id;
      } catch (saveError) {
        logger.warn('Failed to save AI response to database:', saveError);
        // Continue with the response even if saving fails
      }
    }

    // Add the player action and AI response to context
    contextManager.addContextLayer(campaignId, 'immediate', `Player Action: ${playerAction}`, 8);

    contextManager.addContextLayer(campaignId, 'immediate', `AI Response: ${response.content}`, 7);

    return res.json({
      success: true,
      aiResponse: response.content,
      usage: response.usage,
      message: 'Story response generated successfully',
      userMessageId,
      aiMessageId,
    });
  } catch (error) {
    logger.error('Error generating story response:', error);
    return res.status(500).json({
      error: 'Failed to generate story response',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Generate AI story with character extraction
router.post('/story-generate', async (req, res) => {
  try {
    const { prompt, campaignId, sessionId } = req.body;

    // Validate required fields
    if (!prompt || !campaignId || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: prompt, campaignId, sessionId',
      });
    }

    // Get campaign context
    const campaignContext = await contextManager.getContext(campaignId);

    // Get recent chat history for conversation context (max 10 messages)
    const { Message: MessageModel } = await import('../models');
    const chatHistory = await MessageModel.getRecentContext(sessionId, 10, [
      'player',
      'ai',
      'system',
    ]);

    // Build conversation context for AI
    const conversationContext: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    // Limit conversation history to prevent context overflow
    const maxHistoryMessages = 8;
    const recentHistory = chatHistory.slice(-maxHistoryMessages);

    // Add chat history messages in chronological order
    recentHistory.forEach(msg => {
      if (msg.type === 'player') {
        conversationContext.push({
          role: 'user',
          parts: [{ text: msg.content }],
        });
      } else if (msg.type === 'ai') {
        conversationContext.push({
          role: 'model',
          parts: [{ text: msg.content }],
        });
      }
    });

    // Add the current message
    conversationContext.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    // STEP 1: Generate AI response with conversation history
    const response = await geminiClient.sendPrompt({
      prompt: prompt,
      context: campaignContext,
      taskType: 'story_response',
      conversationHistory: conversationContext,
    });

    if (!response.success) {
      return res.status(500).json({
        error: 'Failed to generate AI response',
        details: response.error,
      });
    }

    // Get the story content (remove any existing character markers)
    let storyContent = response.content;

    // Remove any existing character extraction markers if present
    if (storyContent.includes('---CHARACTERS---')) {
      storyContent = storyContent.split('---CHARACTERS---')[0].trim();
    }

    // Ensure storyContent is not empty
    if (!storyContent || storyContent.trim() === '') {
      storyContent = 'AI response received but content is empty';
    }

    // STEP 2: Use a second LLM call to extract character information
    let charactersData: any[] = [];
    try {
      const characterExtractionResponse = await geminiClient.extractCharacterInformation(
        storyContent,
        prompt
      );

      if (characterExtractionResponse.success) {
        try {
          // Try to parse the JSON response
          const jsonMatch = characterExtractionResponse.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            charactersData = JSON.parse(jsonMatch[0]);
            logger.info('Character extraction successful', {
              characterCount: charactersData.length,
              characterNames: charactersData.map(c => c.name),
            });
          } else {
            logger.warn('No JSON array found in character extraction response');
            charactersData = [];
          }
        } catch (parseError) {
          logger.warn('Failed to parse character extraction JSON:', parseError);
          charactersData = [];
        }
      } else {
        logger.warn('Character extraction failed:', characterExtractionResponse.error);
        charactersData = [];
      }
    } catch (extractionError) {
      logger.error('Error during character extraction:', extractionError);
      charactersData = [];
    }

    // STEP 3: Use a third LLM call to extract location information
    let locationsData: any[] = [];
    try {
      const locationExtractionResponse = await geminiClient.extractLocationInformation(
        storyContent,
        prompt
      );

      if (locationExtractionResponse.success) {
        try {
          // Try to parse the JSON response
          const jsonMatch = locationExtractionResponse.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            locationsData = JSON.parse(jsonMatch[0]);
            logger.info('Location extraction successful', {
              locationCount: locationsData.length,
              locationNames: locationsData.map(l => l.name),
            });
          } else {
            logger.warn('No JSON array found in location extraction response');
            locationsData = [];
          }
        } catch (parseError) {
          logger.warn('Failed to parse location extraction JSON:', parseError);
          locationsData = [];
        }
      } else {
        logger.warn('Location extraction failed:', locationExtractionResponse.error);
        locationsData = [];
      }
    } catch (extractionError) {
      logger.error('Error during location extraction:', extractionError);
      locationsData = [];
    }

    // If no locations found through LLM extraction, try fallback method
    if (locationsData.length === 0) {
      locationsData = extractLocationsFromText(storyContent, prompt);
      logger.info('Fallback location extraction found locations:', {
        locationCount: locationsData.length,
        locationNames: locationsData.map(l => l.name),
      });
    }

    // If no characters found through LLM extraction, fall back to the old method
    if (charactersData.length === 0) {
      charactersData = extractCharactersFromText(storyContent, prompt);
      logger.info('Fallback character extraction found characters:', {
        characterCount: charactersData.length,
        characterNames: charactersData.map(c => c.name),
      });
    }

    // Filter out any characters that might actually be locations
    const locationKeywords = [
      'castle',
      'fortress',
      'tower',
      'keep',
      'citadel',
      'palace',
      'town',
      'city',
      'village',
      'settlement',
      'hamlet',
      'borough',
      'dungeon',
      'cave',
      'ruin',
      'tomb',
      'crypt',
      'catacomb',
      'forest',
      'mountain',
      'hill',
      'valley',
      'desert',
      'swamp',
      'shop',
      'tavern',
      'inn',
      'market',
      'bazaar',
      'forge',
      'temple',
      'shrine',
      'church',
      'monastery',
      'sanctuary',
      'landmark',
      'monument',
      'statue',
      'gate',
      'bridge',
      'wall',
    ];

    const filteredCharacters = charactersData.filter(char => {
      const charName = char.name.toLowerCase();
      // Check if the character name contains location keywords
      const isLocation = locationKeywords.some(
        keyword =>
          charName.includes(keyword) ||
          charName.includes('the ') ||
          charName.includes('an ') ||
          charName.includes('a ')
      );

      if (isLocation) {
        logger.info('Filtered out potential location name as character:', char.name);
      }

      return !isLocation;
    });

    if (filteredCharacters.length !== charactersData.length) {
      logger.info('Filtered characters to remove location names:', {
        originalCount: charactersData.length,
        filteredCount: filteredCharacters.length,
        removedNames: charactersData
          .filter(char => !filteredCharacters.some(fc => fc.name === char.name))
          .map(char => char.name),
      });
      charactersData = filteredCharacters;
    }

    // Process characters if any were mentioned
    const processedCharacters: any[] = [];
    if (charactersData.length > 0) {
      const CharacterService = require('../services/CharacterService').default;
      const characterService = new CharacterService();

      for (const charData of charactersData) {
        try {
          // Check if character already exists
          const existingCharacter = await characterService.getCharacterByName(
            charData.name,
            campaignId
          );

          if (existingCharacter) {
            // Update existing character if needed
            const updatedCharacter = await characterService.updateCharacter(
              existingCharacter._id,
              charData
            );
            processedCharacters.push(updatedCharacter);
          } else {
            // Create new character
            const newCharacter = await characterService.createAICharacter({
              ...charData,
              campaignId,
              sessionId,
              createdBy: 'ai-system',
            });
            processedCharacters.push(newCharacter);
          }
        } catch (charError) {
          logger.error('Error processing character:', charError);
          // Continue with other characters
        }
      }
    }

    // Process locations if any were mentioned
    const processedLocations: any[] = [];
    if (locationsData.length > 0) {
      const LocationService = require('../services/LocationService').default;
      const locationService = new LocationService();

      for (const locData of locationsData) {
        try {
          // Validate and clean location data
          const cleanLocationData = {
            name: locData.name || 'Unknown Location',
            description: locData.description || 'Location discovered during adventure',
            type: locData.type || 'other',
            importance: locData.importance || 'moderate',
            tags: Array.isArray(locData.tags) ? locData.tags : [],
            coordinates: locData.coordinates || undefined,
            climate: locData.climate || undefined,
            terrain: locData.terrain || undefined,
            lighting: locData.lighting || undefined,
            weather: locData.weather || undefined,
            resources: Array.isArray(locData.resources) ? locData.resources : [],
            pointsOfInterest: Array.isArray(locData.pointsOfInterest)
              ? locData.pointsOfInterest.map(poi => ({
                name: poi.name || 'Unknown POI',
                description: poi.description || 'Point of interest',
                type: poi.type || 'unknown',
                isExplored: Boolean(poi.isExplored),
              }))
              : [],
            campaignId,
            sessionId,
            discoveredBy: ['AI System'],
            createdBy: 'ai-system',
          };

          // Check if location already exists
          const existingLocation = await locationService.getLocationByName(
            cleanLocationData.name,
            campaignId
          );

          if (existingLocation) {
            // Update existing location if needed
            const updatedLocation = await locationService.updateLocation(
              existingLocation._id,
              cleanLocationData
            );
            processedLocations.push(updatedLocation);
          } else {
            // Create new location
            const newLocation = await locationService.createLocation(cleanLocationData);
            processedLocations.push(newLocation);
          }
        } catch (locError) {
          logger.error('Error processing location:', {
            error: locError,
            locationData: locData,
            campaignId,
            sessionId,
          });
          // Continue with other locations
        }
      }
    }

    // Save the user message to the database
    const Message = require('../models').Message;
    const userMessage = new Message({
      sessionId,
      campaignId,
      type: 'player',
      sender: 'You',
      content: prompt,
      timestamp: new Date(),
      metadata: {
        aiResponse: false,
        originalMessage: prompt,
      },
    });
    await userMessage.save();

    // Save the AI response to the database
    const aiMessage = new Message({
      sessionId,
      campaignId,
      type: 'ai',
      sender: 'AI Game Master',
      content: storyContent,
      timestamp: new Date(),
      metadata: {
        aiResponse: true,
        originalMessage: prompt,
        charactersExtracted: processedCharacters.length,
        locationsExtracted: processedLocations.length,
        usage: response.usage,
        characterExtractionMethod:
          charactersData.length > 0 ? 'llm_extraction' : 'fallback_extraction',
        locationExtractionMethod: locationsData.length > 0 ? 'llm_extraction' : 'none',
      },
    });
    await aiMessage.save();

    // Add the story generation to context
    contextManager.addContextLayer(campaignId, 'immediate', `Story Generated: ${prompt}`, 8);

    return res.json({
      success: true,
      content: storyContent,
      characters: processedCharacters,
      locations: processedLocations,
      usage: response.usage,
      message: 'Story generated successfully',
      userMessageId: userMessage._id,
      aiMessageId: aiMessage._id,
    });
  } catch (error) {
    logger.error('Error generating story:', error);
    return res.status(500).json({
      error: 'Failed to generate story',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper function to extract character names from text
function extractCharactersFromText(storyContent: string, originalPrompt: string): any[] {
  const characters: any[] = [];

  // Look for character names mentioned in the story
  // Improved pattern to catch names like "Legolas", "Thorin Ironforge", "Gimli", "Merlin", etc.
  const namePatterns = [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Basic name pattern
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // Three-word names like "Gandalf the Grey"
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // Two-word names like "Legolas Greenleaf"
  ];

  // Also look for names mentioned in the original prompt
  const promptNamePattern = /named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  const promptMatches = [...originalPrompt.matchAll(promptNamePattern)];
  const promptNames = promptMatches.map(match => match[1]);

  const potentialNames: string[] = [];

  // Add names from the prompt first (these are the most reliable)
  potentialNames.push(...promptNames);

  // Then add names from the story content
  namePatterns.forEach(pattern => {
    const matches = storyContent.match(pattern) || [];
    potentialNames.push(...matches);
  });

  // Filter out common words that aren't names
  const commonWords = [
    'The',
    'You',
    'Your',
    'This',
    'That',
    'They',
    'Their',
    'Oakhaven',
    'Silverstream',
    'Whisperwind',
    'Gilded',
    'Griffin',
    'Whispering',
    'Market',
    'Square',
    'Stone',
    'Bridge',
    'River',
    'Mountains',
    'Forest',
    'Town',
    'Village',
    'City',
    'Inn',
    'Tavern',
    'Shop',
    'Market',
    'Square',
    'Street',
    'Road',
    'Path',
    'Trail',
    'Cave',
    'Dungeon',
    'Castle',
    'Tower',
    'Temple',
    'Church',
    'Guild',
    'Academy',
    'Library',
    'Stable',
    'Blacksmith',
    'Armorer',
    'Merchant',
    'Trader',
    'Farmer',
    'Hunter',
    'Guard',
    'Soldier',
    'Knight',
    'Wizard',
    'Sorcerer',
    'Cleric',
    'Rogue',
    'Fighter',
    'Paladin',
    'Ranger',
    'Druid',
    'Monk',
    'Bard',
    'Barbarian',
    'Warlock',
    'Artificer',
    'Grey',
    'White',
    'Black',
    'Red',
    'Blue',
    'Green',
    'Iron',
    'Gold',
    'Silver',
    'Quick',
    'Swift',
    'Strong',
    'Wise',
    'Brave',
    'Mysterious',
    'Ancient',
    'Young',
    'Old',
    'Eldoria',
    'Goblin',
    'Goblins',
    'Mountain',
    'Pass',
    'Peaks',
    'Rocky',
    'Overhang',
    'Spur',
    'Rock',
    'Steel',
    'Iron',
    'Rust',
    'Fire',
    'Battle',
    'Battles',
    'Gauntleted',
    'Double',
    'Bitted',
    'Battleaxe',
    'Dark',
    'Blood',
  ];

  const uniqueNames = [...new Set(potentialNames)].filter(
    name => !commonWords.includes(name) && name.length > 2 && name.split(' ').length <= 3 // Allow up to 3-word names
  );

  // Create basic character records for each unique name
  for (const name of uniqueNames.slice(0, 3)) {
    // Limit to 3 characters
    // Try to infer race and class from the story context
    let inferredRace = 'Unknown';
    let inferredClass = 'Commoner';

    if (
      storyContent.toLowerCase().includes('dwarf') ||
      storyContent.toLowerCase().includes('dwarven')
    ) {
      inferredRace = 'Dwarf';
    } else if (
      storyContent.toLowerCase().includes('elf') ||
      storyContent.toLowerCase().includes('elven')
    ) {
      inferredRace = 'Elf';
    } else if (storyContent.toLowerCase().includes('halfling')) {
      inferredRace = 'Halfling';
    } else if (storyContent.toLowerCase().includes('human')) {
      inferredRace = 'Human';
    }

    if (
      storyContent.toLowerCase().includes('warrior') ||
      storyContent.toLowerCase().includes('fighter')
    ) {
      inferredClass = 'Fighter';
    } else if (
      storyContent.toLowerCase().includes('wizard') ||
      storyContent.toLowerCase().includes('mage')
    ) {
      inferredClass = 'Wizard';
    } else if (storyContent.toLowerCase().includes('ranger')) {
      inferredClass = 'Ranger';
    } else if (
      storyContent.toLowerCase().includes('rogue') ||
      storyContent.toLowerCase().includes('thief')
    ) {
      inferredClass = 'Rogue';
    } else if (
      storyContent.toLowerCase().includes('cleric') ||
      storyContent.toLowerCase().includes('priest')
    ) {
      inferredClass = 'Cleric';
    }

    characters.push({
      name: name,
      race: inferredRace,
      class: inferredClass,
      level: 1,
      characterType: 'ai',
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      hitPoints: {
        maximum: 4,
        current: 4,
        temporary: 0,
      },
      armorClass: 10,
      speed: 30,
      personality: {
        traits: ['Mysterious'],
        ideals: ['Unknown'],
        bonds: ['Unknown'],
        flaws: ['Unknown'],
        background: 'Recently encountered',
        alignment: 'neutral',
      },
      aiPersonality: {
        goals: ['Unknown'],
        fears: ['Unknown'],
        background: `Mentioned in story: ${originalPrompt}`,
      },
    });
  }

  return characters;
}

// Helper function to extract location names from text
function extractLocationsFromText(storyContent: string, originalPrompt: string): any[] {
  const locations: any[] = [];

  // Look for location names mentioned in the story
  // Common location patterns
  const locationPatterns = [
    /\b(Castle|Fortress|Tower|Keep|Citadel|Palace)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /\b(Town|City|Village|Settlement|Hamlet|Borough)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /\b(The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Castle|Fortress|Tower|Keep|Citadel|Palace)/gi,
    /\b(The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Town|City|Village|Settlement|Hamlet|Borough)/gi,
    /\b(The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Forest|Mountain|Hill|Valley|Desert|Swamp)/gi,
    /\b(The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Temple|Shrine|Church|Monastery|Sanctuary)/gi,
    /\b(The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Inn|Tavern|Shop|Market|Bazaar|Forge)/gi,
  ];

  // Also look for names mentioned in the original prompt
  const promptLocationPattern = /(?:at|in|near|to|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  const promptMatches = [...originalPrompt.matchAll(promptLocationPattern)];
  const promptNames = promptMatches.map(match => match[1]);

  const potentialNames: string[] = [];

  // Add names from the prompt first (these are the most reliable)
  potentialNames.push(...promptNames);

  // Then add names from the story content using patterns
  locationPatterns.forEach(pattern => {
    const matches = storyContent.match(pattern) || [];
    potentialNames.push(...matches);
  });

  // Filter out common words that aren't names
  const commonWords = [
    'The',
    'You',
    'Your',
    'This',
    'That',
    'They',
    'Their',
    'Oakhaven',
    'Silverstream',
    'Whisperwind',
    'Gilded',
    'Griffin',
    'Whispering',
    'Market',
    'Square',
    'Stone',
    'Bridge',
    'River',
    'Mountains',
    'Forest',
    'Town',
    'Village',
    'City',
    'Inn',
    'Tavern',
    'Shop',
    'Market',
    'Square',
    'Street',
    'Road',
    'Path',
    'Trail',
    'Cave',
    'Dungeon',
    'Castle',
    'Tower',
    'Temple',
    'Church',
    'Guild',
    'Academy',
    'Library',
    'Stable',
    'Blacksmith',
    'Armorer',
    'Merchant',
    'Trader',
    'Farmer',
    'Hunter',
    'Guard',
    'Soldier',
    'Knight',
    'Wizard',
    'Sorcerer',
    'Cleric',
    'Rogue',
    'Fighter',
    'Paladin',
    'Ranger',
    'Druid',
    'Monk',
    'Bard',
    'Barbarian',
    'Warlock',
    'Artificer',
    'Grey',
    'White',
    'Black',
    'Red',
    'Blue',
    'Green',
    'Iron',
    'Gold',
    'Silver',
    'Quick',
    'Swift',
    'Strong',
    'Wise',
    'Brave',
    'Mysterious',
    'Ancient',
    'Young',
    'Old',
    'Eldoria',
    'Goblin',
    'Goblins',
    'Mountain',
    'Pass',
    'Peaks',
    'Rocky',
    'Overhang',
    'Spur',
    'Rock',
    'Steel',
    'Iron',
    'Rust',
    'Fire',
    'Battle',
    'Battles',
    'Gauntleted',
    'Double',
    'Bitted',
    'Battleaxe',
    'Dark',
    'Blood',
  ];

  const uniqueNames = [...new Set(potentialNames)].filter(
    name => !commonWords.includes(name) && name.length > 2 && name.split(' ').length <= 3 // Allow up to 3-word names
  );

  // Create basic location records for each unique name
  for (const name of uniqueNames.slice(0, 3)) {
    // Limit to 3 locations
    // Try to infer type and description from the story context
    let inferredType = 'other';
    const inferredDescription = 'Recently discovered location';

    if (
      storyContent.toLowerCase().includes('castle') ||
      storyContent.toLowerCase().includes('fortress') ||
      storyContent.toLowerCase().includes('tower') ||
      storyContent.toLowerCase().includes('keep') ||
      storyContent.toLowerCase().includes('citadel') ||
      storyContent.toLowerCase().includes('palace')
    ) {
      inferredType = 'castle';
    } else if (
      storyContent.toLowerCase().includes('town') ||
      storyContent.toLowerCase().includes('city') ||
      storyContent.toLowerCase().includes('village') ||
      storyContent.toLowerCase().includes('settlement') ||
      storyContent.toLowerCase().includes('hamlet') ||
      storyContent.toLowerCase().includes('borough')
    ) {
      inferredType = 'settlement';
    } else if (
      storyContent.toLowerCase().includes('dungeon') ||
      storyContent.toLowerCase().includes('cave') ||
      storyContent.toLowerCase().includes('ruin') ||
      storyContent.toLowerCase().includes('tomb') ||
      storyContent.toLowerCase().includes('crypt') ||
      storyContent.toLowerCase().includes('catacomb')
    ) {
      inferredType = 'dungeon';
    } else if (
      storyContent.toLowerCase().includes('forest') ||
      storyContent.toLowerCase().includes('mountain') ||
      storyContent.toLowerCase().includes('hill') ||
      storyContent.toLowerCase().includes('valley') ||
      storyContent.toLowerCase().includes('desert') ||
      storyContent.toLowerCase().includes('swamp')
    ) {
      inferredType = 'wilderness';
    } else if (
      storyContent.toLowerCase().includes('shop') ||
      storyContent.toLowerCase().includes('tavern') ||
      storyContent.toLowerCase().includes('inn') ||
      storyContent.toLowerCase().includes('market') ||
      storyContent.toLowerCase().includes('bazaar') ||
      storyContent.toLowerCase().includes('forge')
    ) {
      inferredType = 'shop';
    } else if (
      storyContent.toLowerCase().includes('temple') ||
      storyContent.toLowerCase().includes('shrine') ||
      storyContent.toLowerCase().includes('church') ||
      storyContent.toLowerCase().includes('monastery') ||
      storyContent.toLowerCase().includes('sanctuary')
    ) {
      inferredType = 'temple';
    } else if (
      storyContent.toLowerCase().includes('landmark') ||
      storyContent.toLowerCase().includes('monument') ||
      storyContent.toLowerCase().includes('statue') ||
      storyContent.toLowerCase().includes('gate') ||
      storyContent.toLowerCase().includes('bridge') ||
      storyContent.toLowerCase().includes('wall')
    ) {
      inferredType = 'landmark';
    }

    locations.push({
      name: name,
      type: inferredType,
      description: inferredDescription,
      importance: 'moderate',
      tags: [inferredType, 'discovered'],
      discoveredBy: ['AI System'],
      createdBy: 'ai-system',
    });
  }

  return locations;
}

// Get campaign context
router.get('/context/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }

    const context = await contextManager.getContext(campaignId);
    const stats = contextManager.getContextStats(campaignId);

    return res.json({
      success: true,
      context,
      stats,
      message: 'Campaign context retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting campaign context:', error);
    return res.status(500).json({
      error: 'Failed to get campaign context',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get prompt templates
router.get('/prompt-templates', async (req, res) => {
  try {
    const { category } = req.query;

    let templates;
    if (category) {
      templates = promptService.getTemplatesByCategory(category as any);
    } else {
      templates = promptService.getAllTemplates();
    }

    const metadata = promptService.getTemplateMetadata(category as any);

    return res.json({
      success: true,
      templates,
      metadata,
      message: 'Prompt templates retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting prompt templates:', error);
    return res.status(500).json({
      error: 'Failed to get prompt templates',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
