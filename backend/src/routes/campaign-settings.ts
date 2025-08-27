import express from 'express';
import Campaign from '../models/Campaign';
import logger from '../services/LoggerService';

const router = express.Router();

// Get campaign settings
router.get('/:campaignId/settings', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.json({
      campaignId: campaign._id,
      settings: campaign.settings,
    });
  } catch (error) {
    logger.error('Error fetching campaign settings:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign settings' });
  }
});

// Update campaign settings
router.put('/:campaignId/settings', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { settings } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update settings
    campaign.settings = {
      ...campaign.settings,
      ...settings,
    };

    await campaign.save();

    logger.info('Campaign settings updated', { campaignId, updatedFields: Object.keys(settings) });

    return res.json({
      message: 'Campaign settings updated successfully',
      settings: campaign.settings,
    });
  } catch (error) {
    logger.error('Error updating campaign settings:', error);
    return res.status(500).json({ error: 'Failed to update campaign settings' });
  }
});

// Update AI behavior settings
router.put('/:campaignId/settings/ai-behavior', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { aiBehavior } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update AI behavior settings
    campaign.settings.aiBehavior = {
      ...campaign.settings.aiBehavior,
      ...aiBehavior,
    };

    await campaign.save();

    logger.info('AI behavior settings updated', { campaignId, aiBehavior });

    return res.json({
      message: 'AI behavior settings updated successfully',
      aiBehavior: campaign.settings.aiBehavior,
    });
  } catch (error) {
    logger.error('Error updating AI behavior settings:', error);
    return res.status(500).json({ error: 'Failed to update AI behavior settings' });
  }
});

// Update campaign rules
router.put('/:campaignId/settings/rules', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { rules } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update rules
    campaign.settings.rules = {
      ...campaign.settings.rules,
      ...rules,
    };

    await campaign.save();

    logger.info('Campaign rules updated', { campaignId, updatedRules: Object.keys(rules) });

    return res.json({
      message: 'Campaign rules updated successfully',
      rules: campaign.settings.rules,
    });
  } catch (error) {
    logger.error('Error updating campaign rules:', error);
    return res.status(500).json({ error: 'Failed to update campaign rules' });
  }
});

// Update player settings
router.put('/:campaignId/settings/player-settings', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { playerSettings } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update player settings
    campaign.settings.playerSettings = {
      ...campaign.settings.playerSettings,
      ...playerSettings,
    };

    await campaign.save();

    logger.info('Player settings updated', {
      campaignId,
      updatedFields: Object.keys(playerSettings),
    });

    return res.json({
      message: 'Player settings updated successfully',
      playerSettings: campaign.settings.playerSettings,
    });
  } catch (error) {
    logger.error('Error updating player settings:', error);
    return res.status(500).json({ error: 'Failed to update player settings' });
  }
});

// Update campaign customization settings
router.put('/:campaignId/settings/customization', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { customization } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update customization settings
    campaign.settings.customization = {
      ...campaign.settings.customization,
      ...customization,
    };

    await campaign.save();

    logger.info('Campaign customization settings updated', {
      campaignId,
      updatedFields: Object.keys(customization),
    });

    return res.json({
      message: 'Campaign customization settings updated successfully',
      customization: campaign.settings.customization,
    });
  } catch (error) {
    logger.error('Error updating campaign customization settings:', error);
    return res.status(500).json({ error: 'Failed to update campaign customization settings' });
  }
});

// Reset campaign settings to defaults
router.post('/:campaignId/settings/reset', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Reset to default settings
    campaign.settings = {
      difficulty: 'medium',
      maxLevel: 20,
      startingLevel: 1,
      experienceRate: 'normal',
      magicLevel: 'medium',
      technologyLevel: 'medieval',
      aiBehavior: {
        creativity: 'medium',
        detailLevel: 'moderate',
        pacing: 'normal',
        combatStyle: 'balanced',
        roleplayDepth: 'moderate',
      },
      rules: {
        houseRules: [],
        customMechanics: [],
        variantRules: [],
        restrictions: [],
        bonuses: [],
      },
      playerSettings: {
        maxPlayers: 6,
        allowNewPlayers: true,
        playerPermissions: {
          canCreateCharacters: true,
          canModifyWorld: false,
          canManageSessions: false,
          canInvitePlayers: false,
        },
      },
      customization: {
        allowCharacterRespec: false,
        allowRetconning: false,
        allowTimeTravel: false,
        allowParallelTimelines: false,
        savePoints: false,
      },
    };

    await campaign.save();

    logger.info('Campaign settings reset to defaults', { campaignId });

    return res.json({
      message: 'Campaign settings reset to defaults successfully',
      settings: campaign.settings,
    });
  } catch (error) {
    logger.error('Error resetting campaign settings:', error);
    return res.status(500).json({ error: 'Failed to reset campaign settings' });
  }
});

export default router;
