import express from 'express';
import { CombatService } from '../services/CombatService';
import logger from '../services/LoggerService';

const router = express.Router();
const combatService = new CombatService();

// Create new combat encounter
router.post('/encounters', async (req, res) => {
  try {
    const encounterData = req.body;
    const encounter = await combatService.createEncounter(encounterData);
    res.status(201).json(encounter);
  } catch (error) {
    logger.error('Error creating combat encounter:', error);
    res.status(500).json({ error: 'Failed to create combat encounter' });
  }
});

// Get combat encounter
router.get('/encounters/:encounterId', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const encounter = await combatService.getEncounter(encounterId);

    if (!encounter) {
      return res.status(404).json({ error: 'Combat encounter not found' });
    }

    return res.json(encounter);
  } catch (error) {
    logger.error('Error fetching combat encounter:', error);
    return res.status(500).json({ error: 'Failed to fetch combat encounter' });
  }
});

// Update combat encounter
router.put('/encounters/:encounterId', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const updateData = req.body;

    const encounter = await combatService.updateEncounter(encounterId, updateData);
    return res.json(encounter);
  } catch (error) {
    logger.error('Error updating combat encounter:', error);
    return res.status(500).json({ error: 'Failed to update combat encounter' });
  }
});

// Start combat encounter
router.post('/encounters/:encounterId/start', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const encounter = await combatService.startEncounter(encounterId);
    return res.json(encounter);
  } catch (error) {
    logger.error('Error starting combat encounter:', error);
    return res.status(500).json({ error: 'Failed to start combat encounter' });
  }
});

// End combat encounter
router.post('/encounters/:encounterId/end', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const { result } = req.body;

    const encounter = await combatService.endEncounter(
      encounterId,
      result as 'victory' | 'defeat' | 'retreat'
    );
    return res.json(encounter);
  } catch (error) {
    logger.error('Error ending combat encounter:', error);
    return res.status(500).json({ error: 'Failed to end combat encounter' });
  }
});

// Add participant to encounter
router.post('/encounters/:encounterId/participants', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const participantData = req.body;

    const encounter = await combatService.addParticipant(encounterId, participantData);
    return res.json(encounter);
  } catch (error) {
    logger.error('Error adding participant to encounter:', error);
    return res.status(500).json({ error: 'Failed to add participant to encounter' });
  }
});

// Remove participant from encounter
router.delete('/encounters/:encounterId/participants/:participantId', async (req, res) => {
  try {
    const { encounterId, participantId } = req.params;
    const encounter = await combatService.removeParticipant(encounterId, participantId);
    return res.json(encounter);
  } catch (error) {
    logger.error('Error removing participant from encounter:', error);
    return res.status(500).json({ error: 'Failed to remove participant from encounter' });
  }
});

// Update participant status
router.put('/encounters/:encounterId/participants/:participantId', async (req, res) => {
  try {
    const { encounterId, participantId } = req.params;
    const updateData = req.body;

    const encounter = await combatService.updateParticipant(encounterId, participantId, updateData);
    return res.json(encounter);
  } catch (error) {
    logger.error('Error updating participant:', error);
    return res.status(500).json({ error: 'Failed to update participant' });
  }
});

// Roll initiative for all participants
router.post('/encounters/:encounterId/initiative', async (_req, res) => {
  try {
    // Note: rollInitiative is private, this would need to be implemented as a public method
    // For now, return a placeholder response
    return res.json({ message: 'Initiative rolling not yet implemented' });
  } catch (error) {
    logger.error('Error rolling initiative:', error);
    return res.status(500).json({ error: 'Failed to roll initiative' });
  }
});

// Start next round
router.post('/encounters/:encounterId/rounds/next', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const round = await combatService.startNextRound(encounterId);
    return res.json(round);
  } catch (error) {
    logger.error('Error starting next round:', error);
    return res.status(500).json({ error: 'Failed to start next round' });
  }
});

// End current round
router.post('/encounters/:encounterId/rounds/end', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const round = await combatService.endCurrentRound(encounterId);
    return res.json(round);
  } catch (error) {
    logger.error('Error ending current round:', error);
    return res.status(500).json({ error: 'Failed to end current round' });
  }
});

// Perform combat action
router.post('/encounters/:encounterId/actions', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const actionData = req.body;

    const action = await combatService.performAction(encounterId, actionData);
    return res.json(action);
  } catch (error) {
    logger.error('Error performing combat action:', error);
    return res.status(500).json({ error: 'Failed to perform combat action' });
  }
});

// Get combat actions for a round
router.get('/encounters/:encounterId/rounds/:roundNumber/actions', async (req, res) => {
  try {
    const { encounterId, roundNumber } = req.params;
    const actions = await combatService.getRoundActions(encounterId, parseInt(roundNumber));
    return res.json(actions);
  } catch (error) {
    logger.error('Error fetching round actions:', error);
    return res.status(500).json({ error: 'Failed to fetch round actions' });
  }
});

// Get current turn information
router.get('/encounters/:encounterId/current-turn', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const turnInfo = await combatService.getCurrentTurn(encounterId);
    return res.json(turnInfo);
  } catch (error) {
    logger.error('Error fetching current turn:', error);
    return res.status(500).json({ error: 'Failed to fetch current turn' });
  }
});

// Move to next turn
router.post('/encounters/:encounterId/next-turn', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const turnInfo = await combatService.nextTurn(encounterId);
    return res.json(turnInfo);
  } catch (error) {
    logger.error('Error moving to next turn:', error);
    return res.status(500).json({ error: 'Failed to move to next turn' });
  }
});

// Get encounter summary
router.get('/encounters/:encounterId/summary', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const summary = await combatService.getEncounterSummary(encounterId);
    return res.json(summary);
  } catch (error) {
    logger.error('Error fetching encounter summary:', error);
    return res.status(500).json({ error: 'Failed to fetch encounter summary' });
  }
});

// Get campaign encounters
router.get('/campaigns/:campaignId/encounters', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, sessionId } = req.query;

    const filters: any = { campaignId };
    if (status) filters.status = status;
    if (sessionId) filters.sessionId = sessionId;

    const encounters = await combatService.getCampaignEncounters(campaignId, filters);
    return res.json(encounters);
  } catch (error) {
    logger.error('Error fetching campaign encounters:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign encounters' });
  }
});

// Get session encounters (for resuming combat)
router.get('/sessions/:sessionId/encounters', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const encounters = await combatService.getSessionEncounters(sessionId);
    return res.json(encounters);
  } catch (error) {
    logger.error('Error fetching session encounters:', error);
    return res.status(500).json({ error: 'Failed to fetch session encounters' });
  }
});

// Resume combat encounter
router.post('/encounters/:encounterId/resume', async (req, res) => {
  try {
    const { encounterId } = req.params;
    const encounter = await combatService.resumeEncounter(encounterId);

    if (!encounter) {
      return res.status(404).json({ error: 'Combat encounter not found' });
    }

    return res.json(encounter);
  } catch (error) {
    logger.error('Error resuming combat encounter:', error);
    return res.status(500).json({ error: 'Failed to resume combat encounter' });
  }
});

// Pause combat encounter
router.post('/encounters/:encounterId/pause', async (req, res) => {
  try {
    const { encounterId } = req.params;
    await combatService.pauseEncounter(encounterId);
    return res.json({ message: 'Combat encounter paused successfully' });
  } catch (error) {
    logger.error('Error pausing combat encounter:', error);
    return res.status(500).json({ error: 'Failed to pause combat encounter' });
  }
});

export default router;
