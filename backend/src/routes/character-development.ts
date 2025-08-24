import express from 'express';
import { CharacterDevelopmentService } from '../services/CharacterDevelopmentService';
import logger from '../services/LoggerService';

const router = express.Router();
const characterDevelopmentService = new CharacterDevelopmentService();

// Get character memories
router.get('/characters/:characterId/memories', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { type, importance, archived } = req.query;

    const filters: any = { characterId };
    if (type) filters.type = type;
    if (importance) filters.importance = parseInt(importance as string);
    if (archived !== undefined) filters.archived = archived === 'true';

    const memories = await characterDevelopmentService.getMemories(characterId, filters);
    res.json(memories);
  } catch (error) {
    logger.error('Error fetching character memories:', error);
    res.status(500).json({ error: 'Failed to fetch character memories' });
  }
});

// Add character memory
router.post('/characters/:characterId/memories', async (req, res) => {
  try {
    const { characterId } = req.params;
    const memoryData = req.body;

    const memory = await characterDevelopmentService.addMemory({
      ...memoryData,
      characterId,
    });

    res.status(201).json(memory);
  } catch (error) {
    logger.error('Error adding character memory:', error);
    res.status(500).json({ error: 'Failed to add character memory' });
  }
});

// Get character relationships
router.get('/characters/:characterId/relationships', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { targetType, relationshipType } = req.query;

    const filters: any = { characterId };
    if (targetType) filters.targetType = targetType;
    if (relationshipType) filters.relationshipType = relationshipType;

    const relationships = await characterDevelopmentService.getRelationships(characterId, filters);
    res.json(relationships);
  } catch (error) {
    logger.error('Error fetching character relationships:', error);
    res.status(500).json({ error: 'Failed to fetch character relationships' });
  }
});

// Add/update character relationship
router.post('/characters/:characterId/relationships', async (req, res) => {
  try {
    const { characterId } = req.params;
    const relationshipData = req.body;

    const relationship = await characterDevelopmentService.addOrUpdateRelationship({
      ...relationshipData,
      characterId,
    });

    res.status(201).json(relationship);
  } catch (error) {
    logger.error('Error managing character relationship:', error);
    res.status(500).json({ error: 'Failed to manage character relationship' });
  }
});

// Get character knowledge
router.get('/characters/:characterId/knowledge', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { category, level } = req.query;

    const filters: any = { characterId };
    if (category) filters.category = category;
    if (level) filters.level = level;

    const knowledge = await characterDevelopmentService.getKnowledge(characterId, filters);
    res.json(knowledge);
  } catch (error) {
    logger.error('Error fetching character knowledge:', error);
    res.status(500).json({ error: 'Failed to fetch character knowledge' });
  }
});

// Add character knowledge
router.post('/characters/:characterId/knowledge', async (req, res) => {
  try {
    const { characterId } = req.params;
    const knowledgeData = req.body;

    const knowledge = await characterDevelopmentService.addKnowledge({
      ...knowledgeData,
      characterId,
    });

    res.status(201).json(knowledge);
  } catch (error) {
    logger.error('Error adding character knowledge:', error);
    res.status(500).json({ error: 'Failed to add character knowledge' });
  }
});

// Get character development notes
router.get('/characters/:characterId/development-notes', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { type, impact, sessionId } = req.query;

    const filters: any = { characterId };
    if (type) filters.type = type;
    if (impact) filters.impact = impact;
    if (sessionId) filters.sessionId = sessionId;

    const notes = await characterDevelopmentService.getDevelopmentNotes(characterId, filters);
    res.json(notes);
  } catch (error) {
    logger.error('Error fetching character development notes:', error);
    res.status(500).json({ error: 'Failed to fetch character development notes' });
  }
});

// Add character development note
router.post('/characters/:characterId/development-notes', async (req, res) => {
  try {
    const { characterId } = req.params;
    const noteData = req.body;

    const note = await characterDevelopmentService.addDevelopmentNote({
      ...noteData,
      characterId,
    });

    res.status(201).json(note);
  } catch (error) {
    logger.error('Error adding character development note:', error);
    res.status(500).json({ error: 'Failed to add character development note' });
  }
});

// Get character arc
router.get('/characters/:characterId/arc', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }

    const arc = await characterDevelopmentService.getCharacterArc(
      characterId,
      campaignId as string
    );
    return res.json(arc);
  } catch (error) {
    logger.error('Error fetching character arc:', error);
    return res.status(500).json({ error: 'Failed to fetch character arc' });
  }
});

// Update character arc
router.put('/characters/:characterId/arc', async (req, res) => {
  try {
    const { characterId } = req.params;
    const arcData = req.body;

    const arc = await characterDevelopmentService.updateCharacterArc(characterId, arcData);
    res.json(arc);
  } catch (error) {
    logger.error('Error updating character arc:', error);
    res.status(500).json({ error: 'Failed to update character arc' });
  }
});

// Get character development summary
router.get('/characters/:characterId/development-summary', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { campaignId } = req.query;

    const summary = await characterDevelopmentService.getCharacterDevelopmentSummary(
      characterId,
      campaignId as string
    );

    return res.json(summary);
  } catch (error) {
    logger.error('Error fetching character development summary:', error);
    return res.status(500).json({ error: 'Failed to fetch character development summary' });
  }
});

export default router;
