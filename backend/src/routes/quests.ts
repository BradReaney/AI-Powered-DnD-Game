import express from 'express';
import QuestService from '../services/QuestService';
import logger from '../services/LoggerService';

const router = express.Router();
const questService = QuestService.getInstance();

// Generate a new quest
router.post('/generate', async (req, res) => {
  try {
    const {
      campaignId,
      questType,
      difficulty,
      partyLevel,
      partySize,
      currentLocation,
      worldState,
    } = req.body;

    // Validate required fields
    if (!campaignId || !questType || !difficulty || !partyLevel || !partySize || !currentLocation) {
      return res.status(400).json({
        error:
          'Missing required fields: campaignId, questType, difficulty, partyLevel, partySize, currentLocation',
      });
    }

    const generatedQuest = await questService.generateQuest(
      campaignId,
      questType,
      difficulty,
      partyLevel,
      partySize,
      currentLocation,
      worldState
    );

    res.status(201).json({
      message: 'Quest generated successfully',
      quest: generatedQuest,
    });
  } catch (error) {
    logger.error('Error generating quest:', error);
    res.status(500).json({ error: 'Failed to generate quest' });
  }
});

// Add quest to campaign
router.post('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const quest = req.body;

    if (!quest.name || !quest.description || !quest.objectives) {
      return res.status(400).json({
        error: 'Missing required quest fields: name, description, objectives',
      });
    }

    await questService.addQuestToCampaign(campaignId, quest);

    res.status(201).json({
      message: 'Quest added to campaign successfully',
    });
  } catch (error) {
    logger.error('Error adding quest to campaign:', error);
    res.status(500).json({ error: 'Failed to add quest to campaign' });
  }
});

// Update quest objective progress
router.put('/campaign/:campaignId/quest/:questName/objective/:objectiveId', async (req, res) => {
  try {
    const { campaignId, questName, objectiveId } = req.params;
    const { progress, completed } = req.body;

    if (progress === undefined || completed === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: progress, completed',
      });
    }

    await questService.updateQuestObjective(campaignId, questName, objectiveId, progress);

    res.status(200).json({
      message: 'Quest objective updated successfully',
    });
  } catch (error) {
    logger.error('Error updating quest objective:', error);
    res.status(500).json({ error: 'Failed to update quest objective' });
  }
});

// Complete a quest
router.put('/campaign/:campaignId/quest/:questName/complete', async (req, res) => {
  try {
    const { campaignId, questName } = req.params;

    await questService.completeQuest(campaignId, questName);

    res.status(200).json({
      message: 'Quest completed successfully',
    });
  } catch (error) {
    logger.error('Error completing quest:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

// Get world exploration data
router.get('/campaign/:campaignId/exploration/:location', async (req, res) => {
  try {
    const { campaignId, location } = req.params;

    const explorationData = await questService.getWorldExplorationData(campaignId, location);

    res.status(200).json({
      message: 'Exploration data retrieved successfully',
      data: explorationData,
    });
  } catch (error) {
    logger.error('Error getting exploration data:', error);
    res.status(500).json({ error: 'Failed to get exploration data' });
  }
});

// Update faction standing
router.put('/campaign/:campaignId/faction/:factionName/standing', async (req, res) => {
  try {
    const { campaignId, factionName } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        error: 'Missing required field: amount',
      });
    }

    await questService.updateFactionStanding(campaignId, factionName, amount);

    res.status(200).json({
      message: 'Faction standing updated successfully',
    });
  } catch (error) {
    logger.error('Error updating faction standing:', error);
    res.status(500).json({ error: 'Failed to update faction standing' });
  }
});

// Get quest templates
router.get('/templates', async (req, res) => {
  try {
    const { type, difficulty, levelRange } = req.query;

    let levelRangeObj = undefined;
    if (levelRange) {
      try {
        levelRangeObj = JSON.parse(levelRange as string);
      } catch (e) {
        return res.status(400).json({
          error: 'Invalid levelRange format. Expected JSON: {"min": 1, "max": 10}',
        });
      }
    }

    const templates = questService.getQuestTemplates(
      type as string,
      difficulty as string,
      levelRangeObj
    );

    res.status(200).json({
      message: 'Quest templates retrieved successfully',
      templates,
    });
  } catch (error) {
    logger.error('Error getting quest templates:', error);
    res.status(500).json({ error: 'Failed to get quest templates' });
  }
});

// Get quest statistics for a campaign
router.get('/campaign/:campaignId/statistics', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const statistics = await questService.getQuestStatistics(campaignId);

    res.status(200).json({
      message: 'Quest statistics retrieved successfully',
      statistics,
    });
  } catch (error) {
    logger.error('Error getting quest statistics:', error);
    res.status(500).json({ error: 'Failed to get quest statistics' });
  }
});

// Get active quests for a campaign
router.get('/campaign/:campaignId/active', async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { campaignId: _campaignId } = req.params;

    // This would typically come from the Campaign model
    // For now, we'll return a placeholder
    res.status(200).json({
      message: 'Active quests retrieved successfully',
      quests: [], // Would be populated from campaign data
    });
  } catch (error) {
    logger.error('Error getting active quests:', error);
    res.status(500).json({ error: 'Failed to get active quests' });
  }
});

// Get completed quests for a campaign
router.get('/campaign/:campaignId/completed', async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { campaignId: _campaignId } = req.params;

    // This would typically come from the Campaign model
    // For now, we'll return a placeholder
    res.status(200).json({
      message: 'Completed quests retrieved successfully',
      quests: [], // Would be populated from campaign data
    });
  } catch (error) {
    logger.error('Error getting completed quests:', error);
    res.status(500).json({ error: 'Failed to get completed quests' });
  }
});

// Get quest details
router.get('/campaign/:campaignId/quest/:questName', async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { campaignId: _campaignId, questName: _questName } = req.params;

    // This would typically come from the Campaign model
    // For now, we'll return a placeholder
    res.status(200).json({
      message: 'Quest details retrieved successfully',
      quest: {
        name: _questName,
        description: 'Quest description',
        objectives: [],
        status: 'active',
      },
    });
  } catch (error) {
    logger.error('Error getting quest details:', error);
    res.status(500).json({ error: 'Failed to get quest details' });
  }
});

// Abandon a quest
router.put('/campaign/:campaignId/quest/:questName/abandon', async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { campaignId: _campaignId, questName: _questName } = req.params;
    const { reason } = req.body;

    // This would typically remove the quest from active quests
    // and potentially add consequences
    res.status(200).json({
      message: 'Quest abandoned successfully',
      reason: reason || 'No reason provided',
    });
  } catch (error) {
    logger.error('Error abandoning quest:', error);
    res.status(500).json({ error: 'Failed to abandon quest' });
  }
});

// Get quest recommendations based on party level and campaign state
router.get('/campaign/:campaignId/recommendations', async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { campaignId: _campaignId } = req.params;
    const { partyLevel, partySize, currentLocation } = req.query;

    if (!partyLevel || !partySize || !currentLocation) {
      return res.status(400).json({
        error: 'Missing required query parameters: partyLevel, partySize, currentLocation',
      });
    }

    // Get quest templates that match the party level
    const recommendations = questService.getQuestTemplates(undefined, undefined, {
      min: Math.max(1, Number(partyLevel) - 2),
      max: Number(partyLevel) + 2,
    });

    res.status(200).json({
      message: 'Quest recommendations retrieved successfully',
      recommendations: recommendations.slice(0, 5), // Return top 5 recommendations
    });
  } catch (error) {
    logger.error('Error getting quest recommendations:', error);
    res.status(500).json({ error: 'Failed to get quest recommendations' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'QuestService',
    timestamp: new Date().toISOString(),
  });
});

export default router;
