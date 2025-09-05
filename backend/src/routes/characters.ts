import express from 'express';
import CharacterService, { CharacterCreationData } from '../services/CharacterService';
import logger from '../services/LoggerService';

const router = express.Router();
const characterService = new CharacterService();

// Get characters by campaign (query parameter format) - MUST COME FIRST
router.get('/', async (req, res) => {
  try {
    const { campaignId } = req.query;

    // If campaignId is provided as query parameter, get characters by campaign
    if (campaignId && campaignId !== 'undefined') {
      const characters = await characterService.getCharactersByCampaign(campaignId as string);
      return res.json(characters);
    }

    // If no campaignId, return all characters
    const characters = await characterService.getAllCharacters();
    return res.json(characters);
  } catch (error) {
    logger.error('Error getting characters:', error);
    return res.status(500).json({ error: 'Failed to get characters' });
  }
});

// Get characters by campaign (path parameter format)
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Validate campaignId
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        error: 'Invalid campaign ID',
        details: 'Campaign ID is required and cannot be undefined',
      });
    }

    const characters = await characterService.getCharactersByCampaign(campaignId);
    res.json(characters);
  } catch (error) {
    logger.error('Error getting characters by campaign:', error);
    res.status(500).json({ error: 'Failed to get characters by campaign' });
  }
});

// Get characters by session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const characters = await characterService.getCharactersBySession(sessionId);
    res.json(characters);
  } catch (error) {
    logger.error('Error getting characters by session:', error);
    res.status(500).json({ error: 'Failed to get characters by session' });
  }
});

// Get character by ID - MUST COME AFTER SPECIFIC ROUTES
router.get('/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.getCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character);
  } catch (error) {
    logger.error('Error getting character:', error);
    return res.status(500).json({ error: 'Failed to get character' });
  }
});

// Create human character
router.post('/human', async (req, res) => {
  try {
    const characterData = req.body;

    // Validate required fields
    const requiredFields = [
      'name',
      'race',
      'class',
      'attributes',
      'personality',
      'campaignId',
      'sessionId',
      'createdBy',
    ];

    for (const field of requiredFields) {
      if (!characterData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate attributes
    const attributes = characterData.attributes;
    const attributeNames = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ];

    for (const attr of attributeNames) {
      if (typeof attributes[attr] !== 'number' || attributes[attr] < 3 || attributes[attr] > 18) {
        return res.status(400).json({ error: `Invalid ${attr} value: must be 3-18` });
      }
    }

    // Validate personality
    const personality = characterData.personality;
    const personalityFields = ['traits', 'ideals', 'bonds', 'flaws', 'background', 'alignment'];

    for (const field of personalityFields) {
      if (!personality[field]) {
        return res.status(400).json({ error: `Missing personality field: ${field}` });
      }
    }

    const character = await characterService.createHumanCharacter(characterData);
    return res.status(201).json(character);
  } catch (error) {
    logger.error('Error creating human character:', error);
    return res.status(500).json({ error: 'Failed to create human character' });
  }
});

// Create AI character
router.post('/ai', async (req, res) => {
  try {
    const characterData = req.body;

    // Validate required fields
    const requiredFields = ['race', 'class', 'personality', 'campaignId', 'sessionId', 'createdBy'];

    for (const field of requiredFields) {
      if (!characterData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate personality
    const personality = characterData.personality;
    const personalityFields = ['goals', 'fears', 'background'];

    for (const field of personalityFields) {
      if (!personality[field]) {
        return res.status(400).json({ error: `Missing personality field: ${field}` });
      }
    }

    // Validate arrays
    if (!Array.isArray(personality.goals) || !Array.isArray(personality.fears)) {
      return res.status(400).json({ error: 'Goals and fears must be arrays' });
    }

    const character = await characterService.createAICharacter(characterData);
    return res.status(201).json(character);
  } catch (error) {
    logger.error('Error creating AI character:', error);
    return res.status(500).json({ error: 'Failed to create AI character' });
  }
});

// Create gameplay NPC (met during gameplay)
router.post('/gameplay-npc', async (req, res) => {
  try {
    const npcData = req.body;

    // Validate required fields
    const requiredFields = [
      'name',
      'race',
      'class',
      'role',
      'personality',
      'description',
      'campaignId',
      'sessionId',
      'currentLocation',
      'relationshipToParty',
    ];

    for (const field of requiredFields) {
      if (!npcData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const character = await characterService.createGameplayNPC(npcData);
    return res.status(201).json(character);
  } catch (error) {
    logger.error('Error creating gameplay NPC:', error);
    return res.status(500).json({ error: 'Failed to create gameplay NPC' });
  }
});

// General character creation endpoint
router.post('/', async (req, res) => {
  try {
    const characterData = req.body;

    // Always create human character - transform the data to match the expected format
    const humanCharacterData = {
      ...characterData,
      race: characterData.race || 'Human', // Default race
      class: characterData.class || 'Fighter', // Default class
      attributes: characterData.attributes || characterData.stats, // Use attributes field or fallback to stats
      personality: {
        traits: Array.isArray(characterData.traits)
          ? characterData.traits
          : characterData.traits
            ? [characterData.traits]
            : [],
        ideals: Array.isArray(characterData.ideals)
          ? characterData.ideals
          : characterData.ideals
            ? [characterData.ideals]
            : [],
        bonds: Array.isArray(characterData.bonds)
          ? characterData.bonds
          : characterData.bonds
            ? [characterData.bonds]
            : [],
        flaws: Array.isArray(characterData.flaws)
          ? characterData.flaws
          : characterData.flaws
            ? [characterData.flaws]
            : [],
        background: characterData.background || '',
        alignment: characterData.alignment || '',
      },
      equipment: characterData.equipment || [], // Handle equipment from form
      backstory: characterData.backstory || '', // Handle backstory from form
      currentLocation: characterData.currentLocation || '', // Handle current location from form
      sessionId: characterData.sessionId || null, // Make sessionId optional
      createdBy: characterData.createdBy || 'user', // Default to 'user' if not provided
    };

    // Characters are now linked to campaigns, not sessions
    // sessionId is optional and will be set when the character joins a session

    const character = await characterService.createHumanCharacter(humanCharacterData);
    return res.status(201).json(character);
  } catch (error) {
    logger.error('Error in general character creation:', error);
    return res.status(500).json({ error: 'Failed to create character' });
  }
});

// Simplified character creation endpoint for testing - generates default D&D stats
router.post('/simple', async (req, res) => {
  try {
    const characterData = req.body;

    // Validate required fields
    if (!characterData.name || !characterData.campaignId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'campaignId'],
      });
    }

    // Generate default D&D 5e attributes (standard array: 15, 14, 13, 12, 10, 8)
    const defaultAttributes = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };

    // Generate default personality based on class
    const defaultPersonality = {
      traits: ['Brave', 'Determined'],
      ideals: ['Honor', 'Duty'],
      bonds: ['Loyal to companions'],
      flaws: ['Sometimes too trusting'],
      background: 'Adventurer',
      alignment: 'Neutral Good',
    };

    // Create character data with defaults
    const simpleCharacterData: CharacterCreationData = {
      name: characterData.name,
      characterType: 'human' as const,
      race: characterData.race || 'Human',
      class: characterData.class || 'Fighter',
      attributes: defaultAttributes,
      personality: defaultPersonality,
      campaignId: characterData.campaignId,
      sessionId: characterData.sessionId || null,
      createdBy: characterData.createdBy || 'user',
    };

    // Characters are now linked to campaigns, not sessions
    // sessionId is optional and will be set when the character joins a session

    const character = await characterService.createHumanCharacter(simpleCharacterData);
    return res.status(201).json(character);
  } catch (error) {
    logger.error('Error in simple character creation:', error);
    return res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character
router.put('/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const updateData = req.body;

    const updatedCharacter = await characterService.updateCharacter(characterId, updateData);

    if (!updatedCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(updatedCharacter);
  } catch (error) {
    logger.error('Error updating character:', error);
    return res.status(500).json({ error: 'Failed to update character' });
  }
});

// Update character current location
router.put('/:characterId/location', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { locationId, locationName } = req.body;

    if (!locationId || !locationName) {
      return res.status(400).json({ error: 'Missing required fields: locationId, locationName' });
    }

    const updatedCharacter = await characterService.updateCharacterLocation(
      characterId,
      locationId,
      locationName
    );

    if (!updatedCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(updatedCharacter);
  } catch (error) {
    logger.error('Error updating character location:', error);
    return res.status(500).json({ error: 'Failed to update character location' });
  }
});

// Update character progress
router.put('/:characterId/progress', async (req, res) => {
  try {
    const { characterId } = req.params;
    const updateData = req.body;

    const character = await characterService.updateCharacterProgress(characterId, updateData);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character);
  } catch (error) {
    logger.error('Error updating character progress:', error);
    return res.status(500).json({ error: 'Failed to update character progress' });
  }
});

// Delete character (soft delete)
router.delete('/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    await characterService.deleteCharacter(characterId);
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    logger.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// Level up character
router.post('/:characterId/level-up', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.levelUpCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character);
  } catch (error) {
    logger.error('Error leveling up character:', error);
    return res.status(500).json({ error: 'Failed to level up character' });
  }
});

// Add experience to character
router.post('/:characterId/experience', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { experience } = req.body;

    if (typeof experience !== 'number' || experience < 0) {
      return res.status(400).json({ error: 'Experience must be a positive number' });
    }

    const character = await characterService.addExperience(characterId, experience);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character);
  } catch (error) {
    logger.error('Error adding experience:', error);
    return res.status(500).json({ error: 'Failed to add experience' });
  }
});

// Get character statistics
router.get('/:characterId/stats', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.getCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Calculate derived stats
    const stats = {
      name: character.name,
      level: character.level,
      experience: character.experience,
      hitPoints: character.hitPoints,
      armorClass: character.armorClass,
      initiative: character.initiative,
      speed: character.speed,
      skills: character.skills,
      equipment: character.equipment,
    };

    return res.json(stats);
  } catch (error) {
    logger.error('Error getting character stats:', error);
    return res.status(500).json({ error: 'Failed to get character stats' });
  }
});

// Perform skill check
router.post('/:characterId/skill-check', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { skill, difficulty, modifiers } = req.body;

    if (!skill || !difficulty) {
      return res.status(400).json({ error: 'Missing skill or difficulty' });
    }

    // Validate difficulty
    const validDifficulties = [
      'very_easy',
      'easy',
      'medium',
      'hard',
      'very_hard',
      'nearly_impossible',
    ];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    // This would typically go through the GameEngineService
    // For now, we'll return a placeholder response
    return res.json({
      message: 'Skill check request received',
      characterId,
      skill,
      difficulty,
      modifiers,
    });
  } catch (error) {
    logger.error('Error processing skill check:', error);
    return res.status(500).json({ error: 'Failed to process skill check' });
  }
});

// Get character equipment
router.get('/:characterId/equipment', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.getCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character.equipment);
  } catch (error) {
    logger.error('Error getting character equipment:', error);
    return res.status(500).json({ error: 'Failed to get character equipment' });
  }
});

// Update character equipment
router.put('/:characterId/equipment', async (req, res) => {
  try {
    const { characterId } = req.params;
    const equipmentData = req.body;

    const character = await characterService.updateCharacter(characterId, {
      equipment: equipmentData,
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character.equipment);
  } catch (error) {
    logger.error('Error updating character equipment:', error);
    return res.status(500).json({ error: 'Failed to update character equipment' });
  }
});

// Get character skills
router.get('/:characterId/skills', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.getCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character.skills);
  } catch (error) {
    logger.error('Error getting character skills:', error);
    return res.status(500).json({ error: 'Failed to get character skills' });
  }
});

// Update character skills
router.put('/:characterId/skills', async (req, res) => {
  try {
    const { characterId } = req.params;
    const skillsData = req.body;

    const character = await characterService.updateCharacter(characterId, { skills: skillsData });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character.skills);
  } catch (error) {
    logger.error('Error updating character skills:', error);
    return res.status(500).json({ error: 'Failed to update character skills' });
  }
});

// Get character personality
router.get('/:characterId/personality', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await characterService.getCharacter(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const personality = {
      ...character.personality,
      aiPersonality: character.aiPersonality,
    };

    return res.json(personality);
  } catch (error) {
    logger.error('Error getting character personality:', error);
    return res.status(500).json({ error: 'Failed to get character personality' });
  }
});

// Update character personality
router.put('/:characterId/personality', async (req, res) => {
  try {
    const { characterId } = req.params;
    const personalityData = req.body;

    const character = await characterService.updateCharacter(characterId, {
      personality: personalityData,
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character.personality);
  } catch (error) {
    logger.error('Error updating character personality:', error);
    return res.status(500).json({ error: 'Failed to update character personality' });
  }
});

// Hard delete character (completely remove)
router.delete('/:characterId/hard', async (req, res) => {
  try {
    const { characterId } = req.params;
    await characterService.hardDeleteCharacter(characterId);
    res.json({ message: 'Character and all related data deleted successfully' });
  } catch (error) {
    logger.error('Error hard deleting character:', error);
    res.status(500).json({ error: 'Failed to hard delete character' });
  }
});

export default router;
