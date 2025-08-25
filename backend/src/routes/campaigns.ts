import express from 'express';
import CampaignService from '../services/CampaignService';
import logger from '../services/LoggerService';

const router = express.Router();
const campaignService = new CampaignService();

// Get all campaigns
router.get('/', async (_req, res) => {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.json(campaigns);
  } catch (error) {
    logger.error('Error getting campaigns:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Get campaigns by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const campaigns = await campaignService.getCampaignsByUser(userId);
    res.json(campaigns);
  } catch (error) {
    logger.error('Error getting campaigns by user:', error);
    res.status(500).json({ error: 'Failed to get campaigns by user' });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const campaignData = req.body;

    // Validate required fields
    if (
      !campaignData.name ||
      !campaignData.theme ||
      !campaignData.description ||
      !campaignData.createdBy
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const campaign = await campaignService.createCampaign(campaignData);
    return res.status(201).json(campaign);
  } catch (error) {
    logger.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get campaign stats
router.get('/:campaignId/stats', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const stats = await campaignService.getCampaignStats(campaignId);
    res.json(stats);
  } catch (error) {
    logger.error('Error getting campaign stats:', error);
    res.status(500).json({ error: 'Failed to get campaign stats' });
  }
});

// Get characters by campaign
router.get('/:campaignId/characters', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get the campaign to access its characters
    const campaign = await campaignService.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get character details for each character in the campaign
    const Character = require('../models').Character;
    const characterPromises = campaign.characters.map(async (charRef: any) => {
      const character = await Character.findById(charRef.characterId);
      if (character) {
        return {
          _id: character._id,
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
          role: charRef.role,
          isActive: charRef.isActive,
          joinedAt: charRef.joinedAt,
        };
      }
      return null;
    });

    const characters = (await Promise.all(characterPromises)).filter(char => char !== null);

    res.json({
      message: 'Characters for campaign',
      campaignId,
      characters,
    });
  } catch (error) {
    logger.error('Error getting characters for campaign:', error);
    res.status(500).json({ error: 'Failed to get characters for campaign' });
  }
});

// Add quest to campaign
router.post('/:campaignId/quests', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const questData = req.body;

    // Validate required fields
    if (
      !questData.name ||
      !questData.description ||
      !questData.objectives ||
      !questData.difficulty ||
      !questData.experienceReward ||
      !questData.location ||
      !questData.questGiver
    ) {
      return res.status(400).json({ error: 'Missing required quest fields' });
    }

    const quest = await campaignService.addQuest(campaignId, questData);
    return res.status(201).json(quest);
  } catch (error) {
    logger.error('Error adding quest:', error);
    return res.status(500).json({ error: 'Failed to add quest' });
  }
});

// Complete quest
router.put('/:campaignId/quests/:questName/complete', async (req, res) => {
  try {
    const { campaignId, questName } = req.params;
    const { outcomes } = req.body;

    await campaignService.completeQuest(campaignId, questName, outcomes);
    res.json({ message: 'Quest completed successfully' });
  } catch (error) {
    logger.error('Error completing quest:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

// Add world event
router.post('/:campaignId/events', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const eventData = req.body;

    // Validate required fields
    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.impact ||
      !eventData.location ||
      !eventData.affectedFactions ||
      !eventData.consequences ||
      !eventData.duration
    ) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const event = await campaignService.addWorldEvent(campaignId, eventData);
    return res.status(201).json(event);
  } catch (error) {
    logger.error('Error adding world event:', error);
    return res.status(500).json({ error: 'Failed to add world event' });
  }
});

// Resolve world event
router.put('/:campaignId/events/:eventTitle/resolve', async (req, res) => {
  try {
    const { campaignId, eventTitle } = req.params;
    const { resolution } = req.body;

    if (!resolution) {
      return res.status(400).json({ error: 'Missing resolution field' });
    }

    await campaignService.resolveWorldEvent(campaignId, eventTitle, resolution);
    return res.json({ message: 'World event resolved successfully' });
  } catch (error) {
    logger.error('Error resolving world event:', error);
    return res.status(500).json({ error: 'Failed to resolve world event' });
  }
});

// Add location
router.post('/:campaignId/locations', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const locationData = req.body;

    // Validate required fields
    if (
      !locationData.name ||
      !locationData.type ||
      !locationData.description
    ) {
      return res.status(400).json({ error: 'Missing required location fields' });
    }

    const location = await campaignService.addLocation(campaignId, locationData);
    return res.status(201).json(location);
  } catch (error) {
    logger.error('Error adding location:', error);
    return res.status(500).json({ error: 'Failed to add location' });
  }
});

// Update location
router.put('/:campaignId/locations/:locationName', async (req, res) => {
  try {
    const { campaignId, locationName } = req.params;
    const updateData = req.body;

    await campaignService.updateLocation(campaignId, locationName, updateData);
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Add faction
router.post('/:campaignId/factions', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const factionData = req.body;

    // Validate required fields
    if (
      !factionData.name ||
      !factionData.type ||
      !factionData.alignment ||
      !factionData.description
    ) {
      return res.status(400).json({ error: 'Missing required faction fields' });
    }

    await campaignService.addFaction(campaignId, factionData);
    return res.status(201).json({ message: 'Faction added successfully' });
  } catch (error) {
    logger.error('Error adding faction:', error);
    return res.status(500).json({ error: 'Failed to add faction' });
  }
});

// Update faction relationship
router.put('/:campaignId/factions/:factionName/relationship', async (req, res) => {
  try {
    const { campaignId, factionName } = req.params;
    const { relationship } = req.body;

    if (!relationship) {
      return res.status(400).json({ error: 'Missing relationship field' });
    }

    await campaignService.updateFactionRelationship(campaignId, factionName, relationship);
    return res.json({ message: 'Faction relationship updated successfully' });
  } catch (error) {
    logger.error('Error updating faction relationship:', error);
    return res.status(500).json({ error: 'Failed to update faction relationship' });
  }
});

// Generate story hook
router.post('/:campaignId/story-hook', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Missing context field' });
    }

    const storyHook = await campaignService.generateStoryHook(campaignId, context);
    return res.json({ storyHook });
  } catch (error) {
    logger.error('Error generating story hook:', error);
    return res.status(500).json({ error: 'Failed to generate story hook' });
  }
});

// Initialize campaign with AI-generated opening scene
router.post('/:campaignId/initialize', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { sessionId, characterIds } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const initialization = await campaignService.initializeCampaign(
      campaignId,
      sessionId,
      characterIds
    );
    return res.json(initialization);
  } catch (error) {
    logger.error('Error initializing campaign:', error);
    return res.status(500).json({ error: 'Failed to initialize campaign' });
  }
});

// Get campaign by ID (MUST BE LAST - most general route)
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await campaignService.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.json(campaign);
  } catch (error) {
    logger.error('Error getting campaign:', error);
    return res.status(500).json({ error: 'Failed to get campaign' });
  }
});

// Update campaign
router.put('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;

    const campaign = await campaignService.updateCampaign(campaignId, updateData);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.json(campaign);
  } catch (error) {
    logger.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign (soft delete - archive)
router.delete('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    await campaignService.deleteCampaign(campaignId);
    res.json({ message: 'Campaign archived successfully' });
  } catch (error) {
    logger.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Hard delete campaign
router.delete('/:campaignId/hard', async (req, res) => {
  try {
    const { campaignId } = req.params;
    await campaignService.hardDeleteCampaign(campaignId);
    res.json({ message: 'Campaign permanently deleted' });
  } catch (error) {
    logger.error('Error hard deleting campaign:', error);
    res.status(500).json({ error: 'Failed to hard delete campaign' });
  }
});

export default router;
