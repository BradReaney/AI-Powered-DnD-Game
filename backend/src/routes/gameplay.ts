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
        playerAction
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
        playerAction
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
      locationsData = extractLocationsFromText(storyContent, playerAction);
      logger.info('Fallback location extraction found locations:', {
        locationCount: locationsData.length,
        locationNames: locationsData.map(l => l.name),
      });
    }

    // If no characters found through LLM extraction, fall back to the old method
    if (charactersData.length === 0) {
      charactersData = extractCharactersFromText(storyContent, playerAction);
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

      // More intelligent filtering: only filter out if the name is clearly a location
      // Check for exact matches or very specific location patterns
      const isLocation = locationKeywords.some(keyword => {
        // Only filter if the keyword is a significant part of the name
        // and not just a common word that might appear in character names
        if (keyword === 'wind' || keyword === 'stone' || keyword === 'iron' || keyword === 'gold') {
          // These are common in character names, don't filter them out
          return false;
        }

        // Check if the name starts with or ends with the keyword
        // This helps avoid filtering out names like "Sylvan Whisperwind" where "wind" is part of a surname
        return (
          charName === keyword ||
          charName.startsWith(keyword + ' ') ||
          charName.endsWith(' ' + keyword) ||
          charName.includes(' ' + keyword + ' ')
        );
      });

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
    const processedCharacters: { current: any; previous?: any; isNew: boolean }[] = [];
    if (charactersData.length > 0 && sessionId) {
      const CharacterService = (await import('../services/CharacterService')).default;
      const characterService = new CharacterService();

      for (const charData of charactersData) {
        try {
          // Check if character already exists
          const existingCharacter = await characterService.getCharacterByName(
            charData.name,
            campaignId
          );

          if (existingCharacter) {
            // Store previous data for change detection
            const previousData = {
              race: existingCharacter.race,
              class: existingCharacter.class,
              level: existingCharacter.level,
              personality: existingCharacter.personality,
            };

            // Update existing character if needed
            const updatedCharacter = await characterService.updateCharacter(
              existingCharacter._id.toString(),
              charData
            );
            processedCharacters.push({
              current: updatedCharacter,
              previous: previousData,
              isNew: false
            });
          } else {
            // Create new character
            const newCharacter = await characterService.createAICharacter({
              ...charData,
              campaignId,
              sessionId,
              createdBy: 'ai-system',
            });
            processedCharacters.push({
              current: newCharacter,
              isNew: true
            });
          }
        } catch (charError) {
          logger.error('Error processing character:', charError);
          // Continue with other characters
        }
      }
    }

    // Process locations if any were mentioned
    const processedLocations: { current: any; previous?: any; isNew: boolean }[] = [];
    if (locationsData.length > 0 && sessionId) {
      const LocationService = (await import('../services/LocationService')).default;
      const locationService = new LocationService();

      for (const locData of locationsData) {
        try {
          // Validate and clean location data
          const cleanLocationData = {
            name: cleanLocationName(locData.name) || 'Unknown Location',
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
              ? locData.pointsOfInterest.map(poi => {
                // Handle both object and string formats
                if (typeof poi === 'string') {
                  // If poi is a string like "Great Hall - Massive chamber with high vaulted ceilings"
                  const parts = poi.split(' - ');
                  return {
                    name: parts[0] || 'Unknown POI',
                    description: parts[1] || 'Point of interest',
                    type: 'unknown',
                    isExplored: false,
                  };
                } else {
                  // If poi is already an object
                  return {
                    name: poi.name || 'Unknown POI',
                    description: poi.description || 'Point of interest',
                    type: poi.type || 'unknown',
                    isExplored: Boolean(poi.isExplored),
                  };
                }
              })
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
            // Store previous data for change detection
            const previousData = {
              type: existingLocation.type,
              description: existingLocation.description,
              importance: existingLocation.importance,
              pointsOfInterest: existingLocation.pointsOfInterest,
            };

            // Update existing location if needed
            const updatedLocation = await locationService.updateLocation(
              existingLocation._id.toString(),
              cleanLocationData
            );
            processedLocations.push({
              current: updatedLocation,
              previous: previousData,
              isNew: false
            });
          } else {
            // Create new location
            const newLocation = await locationService.createLocation(cleanLocationData);
            processedLocations.push({
              current: newLocation,
              isNew: true
            });
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

    // Update AI message metadata with extraction results if sessionId is provided
    if (sessionId && aiMessageId) {
      try {
        const { Message: MessageModel } = await import('../models');
        await MessageModel.findByIdAndUpdate(aiMessageId, {
          $set: {
            'metadata.charactersExtracted': processedCharacters.length,
            'metadata.locationsExtracted': processedLocations.length,
            'metadata.characterExtractionMethod':
              charactersData.length > 0 ? 'llm_extraction' : 'fallback_extraction',
            'metadata.locationExtractionMethod':
              locationsData.length > 0 ? 'llm_extraction' : 'fallback_extraction',
          },
        });
      } catch (updateError) {
        logger.warn('Failed to update AI message metadata with extraction results:', updateError);
      }
    }

    // Generate discovery messages for newly discovered entities
    let discoveryMessages: any[] = [];

    if ((processedCharacters.length > 0 || processedLocations.length > 0) && sessionId) {
      try {
        const DiscoveryMessageService = (await import('../services/DiscoveryMessageService'))
          .default;
        const discoveryService = new DiscoveryMessageService();

        const extractionMethods = {
          characters: charactersData.length > 0 ? 'llm_extraction' : 'fallback_extraction',
          locations: locationsData.length > 0 ? 'llm_extraction' : 'fallback_extraction',
        };

        // Use the new method that tracks updates vs discoveries
        discoveryMessages = discoveryService.generateDiscoveryMessagesWithUpdates(
          processedCharacters,
          processedLocations,
          extractionMethods
        );

        // Save discovery messages to database
        const { Message: MessageModel } = await import('../models');
        for (const messageData of discoveryMessages) {
          const message = new MessageModel({
            sessionId,
            campaignId,
            type: 'system-discovery',
            sender: 'System',
            content: messageData.content,
            timestamp: new Date(),
            metadata: messageData.metadata,
          });
          await message.save();
        }

        logger.info('Discovery messages saved to database', {
          messageCount: discoveryMessages.length,
          campaignId,
          sessionId,
        });
      } catch (discoveryError) {
        logger.error('Error generating discovery messages:', discoveryError);
        discoveryMessages = [];
      }
    }

    // Add the player action and AI response to context
    contextManager.addContextLayer(campaignId, 'immediate', `Player Action: ${playerAction}`, 8);

    contextManager.addContextLayer(campaignId, 'immediate', `AI Response: ${response.content}`, 7);

    // Extract current entities for response (maintaining backward compatibility)
    const currentCharacters = processedCharacters.map(pc => pc.current);
    const currentLocations = processedLocations.map(pl => pl.current);

    return res.json({
      success: true,
      aiResponse: response.content,
      characters: currentCharacters,
      locations: currentLocations,
      discoveryMessages: discoveryMessages,
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
// Helper function to clean location names by removing common words and articles
function cleanLocationName(name: string): string {
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

// Helper function to extract character names from text
function extractCharactersFromText(storyContent: string, originalPrompt: string): any[] {
  const characters: any[] = [];

  // Look for character names mentioned in the story
  // More specific patterns to catch actual character names while avoiding common words
  const namePatterns = [
    // Pattern for compound names first (3+ words like "Gandalf the Grey")
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}\b/g,
    // Pattern for two-word names (like "Legolas Greenleaf")
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    // Pattern for single-word names (like "Gimli", "Merlin")
    /\b[A-Z][a-z]+\b/g,
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
  const commonWordsToExclude = [
    'The', 'This', 'That', 'These', 'Those', 'Here', 'There', 'Where', 'When', 'Why', 'How',
    'What', 'Which', 'Who', 'Whom', 'Whose', 'If', 'Then', 'Else', 'While', 'For', 'And',
    'But', 'Or', 'Nor', 'Yet', 'So', 'Because', 'Since', 'Although', 'Unless', 'Until',
    'Before', 'After', 'During', 'Through', 'Throughout', 'Above', 'Below', 'Under', 'Over',
    'Between', 'Among', 'Around', 'Across', 'Along', 'Behind', 'Beside', 'Beyond', 'Inside',
    'Outside', 'Within', 'Without', 'Against', 'Toward', 'Towards', 'Upon', 'About', 'Above',
    'Across', 'After', 'Against', 'Along', 'Among', 'Around', 'At', 'Before', 'Behind',
    'Below', 'Beneath', 'Beside', 'Between', 'Beyond', 'By', 'Down', 'During', 'Except',
    'For', 'From', 'In', 'Inside', 'Into', 'Like', 'Near', 'Of', 'Off', 'On', 'Out',
    'Outside', 'Over', 'Past', 'Since', 'Through', 'Throughout', 'To', 'Toward', 'Under',
    'Underneath', 'Until', 'Up', 'Upon', 'With', 'Within', 'Without', 'Learned', 'His',
    'Perhaps', 'Her', 'Welcome', 'Ancient', 'Massive', 'Grand', 'Hidden', 'Main', 'Primary',
    // Additional common words that are often capitalized but aren't character names
    'Deep', 'Goblin', 'Forest', 'Castle', 'Inn', 'Tavern', 'Temple', 'Shrine', 'Church',
    'Monastery', 'Sanctuary', 'Shop', 'Market', 'Bazaar', 'Forge', 'Keep', 'Citadel',
    'Palace', 'Town', 'City', 'Village', 'Settlement', 'Hamlet', 'Borough', 'Mountain',
    'Hill', 'Valley', 'Desert', 'Swamp', 'Dungeon', 'Tower', 'Fortress', 'Bridge',
    'Gate', 'Wall', 'Door', 'Window', 'Room', 'Hall', 'Chamber', 'Passage', 'Corridor',
    'Stair', 'Floor', 'Ceiling', 'Roof', 'Garden', 'Courtyard', 'Square', 'Street',
    'Road', 'Path', 'Trail', 'River', 'Lake', 'Ocean', 'Sea', 'Island', 'Cave',
    'Mine', 'Quarry', 'Field', 'Meadow', 'Glade', 'Clearing', 'Thicket', 'Bush',
    'Tree', 'Flower', 'Grass', 'Stone', 'Rock', 'Crystal', 'Gem', 'Metal', 'Wood',
    'Water', 'Fire', 'Earth', 'Air', 'Light', 'Dark', 'Shadow', 'Sun', 'Moon',
    'Star', 'Cloud', 'Rain', 'Snow', 'Wind', 'Storm', 'Thunder', 'Lightning',
    'Magic', 'Spell', 'Scroll', 'Book', 'Potion', 'Ring', 'Amulet', 'Staff',
    'Wand', 'Sword', 'Shield', 'Armor', 'Helmet', 'Boot', 'Glove', 'Cloak',
    'Belt', 'Bag', 'Pouch', 'Chest', 'Box', 'Crate', 'Barrel', 'Bottle',
    'Cup', 'Plate', 'Bowl', 'Knife', 'Fork', 'Spoon', 'Chair', 'Table',
    'Bed', 'Mirror', 'Candle', 'Lamp', 'Torch', 'Fireplace', 'Hearth', 'Oven',
    'Stove', 'Well', 'Fountain', 'Statue', 'Painting', 'Tapestry', 'Banner',
    'Flag', 'Sign', 'Bell', 'Clock', 'Hourglass', 'Compass', 'Map', 'Key',
    'Lock', 'Chain', 'Rope', 'Ladder', 'Wheel', 'Axle', 'Gear', 'Pulley',
    'Lever', 'Button', 'Switch', 'Handle', 'Knob', 'Hinge', 'Nail', 'Screw',
    'Bolt', 'Nut', 'Washer', 'Spring', 'Coil', 'Wire', 'Cable', 'Pipe',
    'Tube', 'Hose', 'Funnel', 'Filter', 'Pump', 'Valve', 'Gauge', 'Meter',
    'Sensor', 'Detector', 'Alarm', 'Siren', 'Whistle', 'Horn', 'Drum',
    'Flute', 'Harp', 'Lute', 'Violin', 'Trumpet', 'Trombone', 'Clarinet',
    'Saxophone', 'Piano', 'Organ', 'Guitar', 'Banjo', 'Mandolin', 'Harmonica',
    'Accordion', 'Bagpipe', 'Tambourine', 'Maraca', 'Triangle', 'Cymbal',
    'Gong', 'Bell', 'Chime', 'Xylophone', 'Vibraphone', 'Marimba', 'Steel',
    'Iron', 'Copper', 'Silver', 'Gold', 'Platinum', 'Bronze', 'Brass',
    'Aluminum', 'Titanium', 'Nickel', 'Zinc', 'Lead', 'Tin', 'Mercury',
    'Sulfur', 'Carbon', 'Nitrogen', 'Oxygen', 'Hydrogen', 'Helium', 'Neon',
    'Argon', 'Krypton', 'Xenon', 'Radon', 'Uranium', 'Plutonium', 'Thorium',
    'Radium', 'Polonium', 'Astatine', 'Francium', 'Radon', 'Actinium',
    'Protactinium', 'Neptunium', 'Americium', 'Curium', 'Berkelium',
    'Californium', 'Einsteinium', 'Fermium', 'Mendelevium', 'Nobelium',
    'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium',
    'Hassium', 'Meitnerium', 'Darmstadtium', 'Roentgenium', 'Copernicium',
    'Nihonium', 'Flerovium', 'Moscovium', 'Livermorium', 'Tennessine',
    'Oganesson'
  ];

  // Additional filtering to ensure we only get actual character names
  const uniqueNames = potentialNames
    .filter(name => name.length > 1) // Filter out single letters
    .filter(name => !commonWordsToExclude.includes(name)) // Filter out common words
    .filter(name => name.split(' ').length <= 3) // Allow up to 3-word names
    .filter(name => !/^(The|A|An)\s/i.test(name)) // Filter out articles at start
    .filter(name => !/^(Castle|Fortress|Tower|Keep|Citadel|Palace|Town|City|Village|Settlement|Hamlet|Borough|Forest|Mountain|Hill|Valley|Desert|Swamp|Temple|Shrine|Church|Monastery|Sanctuary|Inn|Tavern|Shop|Market|Bazaar|Forge)/i.test(name)) // Filter out location types
    .filter(name => {
      // Filter out individual words that are part of compound names
      const words = name.split(' ');
      if (words.length === 1) {
        // For single words, check if they're part of any compound name
        return !potentialNames.some(otherName =>
          otherName !== name &&
          otherName.includes(name) &&
          otherName.split(' ').length > 1
        );
      }
      return true; // Keep compound names
    })
    .filter(name => {
      // Additional context-based filtering
      const lowerName = name.toLowerCase();
      const lowerStory = storyContent.toLowerCase();

      // Check if the name appears in a context that suggests it's a character
      const nameRegex = new RegExp(`\\b${name}\\b`, 'gi');
      const matches = storyContent.match(nameRegex);

      if (!matches) return false;

      // Look for context clues that suggest this is a character
      let hasCharacterContext = false;

      for (const match of matches) {
        const matchIndex = storyContent.indexOf(match);
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(storyContent.length, matchIndex + 100);
        const context = storyContent.substring(contextStart, contextEnd);

        // Check for character-related context
        if (
          context.includes('said') || context.includes('says') || context.includes('speaks') ||
          context.includes('greets') || context.includes('approaches') || context.includes('meets') ||
          context.includes('encounters') || context.includes('sees') || context.includes('notices') ||
          context.includes('named') || context.includes('called') || context.includes('known as') ||
          context.includes('sage') || context.includes('wizard') || context.includes('warrior') ||
          context.includes('ranger') || context.includes('rogue') || context.includes('cleric') ||
          context.includes('dwarf') || context.includes('elf') || context.includes('human') ||
          context.includes('goblin') || context.includes('orc') || context.includes('halfling') ||
          context.includes('dragon') || context.includes('monster') || context.includes('creature') ||
          context.includes('npc') || context.includes('character') || context.includes('person') ||
          context.includes('figure') || context.includes('being') || context.includes('individual')
        ) {
          hasCharacterContext = true;
          break;
        }
      }

      return hasCharacterContext;
    })
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

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
      name,
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
        background: 'Recently encountered',
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
    // Clean the location name to remove common words
    const cleanedName = cleanLocationName(name);

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
      name: cleanedName,
      type: inferredType,
      description: inferredDescription,
      importance: 'moderate',
      tags: [inferredType, 'discovered'],
      pointsOfInterest: [
        {
          name: 'Main Area',
          description: 'Primary area of interest',
          type: 'area',
          isExplored: false,
        },
      ],
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
