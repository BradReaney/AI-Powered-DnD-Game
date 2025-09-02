import express from 'express';
import { Types } from 'mongoose';
import StoryArcService from '../services/StoryArcService';
import StoryValidator from '../services/StoryValidator';
import StoryProgression from '../services/StoryProgression';
import LLMClientFactory from '../services/LLMClientFactory';
import logger from '../services/LoggerService';

const router = express.Router();

// Initialize services
let storyArcService: StoryArcService;
let geminiClient: any;
let storyValidator: StoryValidator;
let storyProgression: StoryProgression;

try {
  logger.info('Initializing story arc services...');
  storyArcService = new StoryArcService();
  logger.info('StoryArcService initialized successfully');

  logger.info('Getting LLM client...');
  geminiClient = LLMClientFactory.getInstance().getClient();
  logger.info('LLM client obtained successfully');

  logger.info('Initializing StoryValidator...');
  storyValidator = new StoryValidator(geminiClient);
  logger.info('StoryValidator initialized successfully');

  logger.info('Initializing StoryProgression...');
  storyProgression = new StoryProgression(geminiClient);
  logger.info('StoryProgression initialized successfully');
} catch (error) {
  logger.error('Error initializing story arc services:', error);
  throw error;
}

/**
 * @route POST /api/story-arcs
 * @desc Create a new story arc for a campaign
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    const { campaignId, theme, tone, pacing, totalChapters } = req.body;

    if (!campaignId || !theme) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and theme are required',
      });
    }

    const storyArc = await storyArcService.createStoryArc({
      campaignId: new Types.ObjectId(campaignId),
      theme,
      tone,
      pacing,
      totalChapters,
    });

    res.status(201).json({
      success: true,
      message: 'Story arc created successfully',
      data: storyArc,
    });
  } catch (error) {
    logger.error(`Error creating story arc: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create story arc',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/story-arcs/campaign/:campaignId
 * @desc Get story arc by campaign ID
 * @access Public
 */
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign ID format',
      });
    }

    const storyArc = await storyArcService.getStoryArcByCampaignId(new Types.ObjectId(campaignId));

    if (!storyArc) {
      return res.status(404).json({
        success: false,
        message: 'Story arc not found for this campaign',
      });
    }

    res.json({
      success: true,
      data: storyArc,
    });
  } catch (error) {
    logger.error(`Error getting story arc: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get story arc',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/story-arcs/:storyArcId/story-beats
 * @desc Add a new story beat to an existing story arc
 * @access Public
 */
router.post('/:storyArcId/story-beats', async (req, res) => {
  try {
    const { storyArcId } = req.params;
    const storyBeatData = req.body;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const updatedStoryArc = await storyArcService.addStoryBeat(
      new Types.ObjectId(storyArcId),
      storyBeatData
    );

    res.json({
      success: true,
      message: 'Story beat added successfully',
      data: updatedStoryArc,
    });
  } catch (error) {
    logger.error(`Error adding story beat: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add story beat',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route PUT /api/story-arcs/:storyArcId/story-beats/:beatId/complete
 * @desc Mark a story beat as completed
 * @access Public
 */
router.put('/:storyArcId/story-beats/:beatId/complete', async (req, res) => {
  try {
    const { storyArcId, beatId } = req.params;
    const { outcome, notes } = req.body;

    if (!Types.ObjectId.isValid(storyArcId) || !Types.ObjectId.isValid(beatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc or beat ID format',
      });
    }

    const updatedStoryArc = await storyArcService.completeStoryBeat(
      new Types.ObjectId(storyArcId),
      beatId,
      outcome,
      notes
    );

    res.json({
      success: true,
      message: 'Story beat completed successfully',
      data: updatedStoryArc,
    });
  } catch (error) {
    logger.error(`Error completing story beat: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to complete story beat',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/story-arcs/:storyArcId/character-milestones
 * @desc Add a character milestone to a story arc
 * @access Public
 */
router.post('/:storyArcId/character-milestones', async (req, res) => {
  try {
    const { storyArcId } = req.params;
    const milestoneData = req.body;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const updatedStoryArc = await storyArcService.addCharacterMilestone(
      new Types.ObjectId(storyArcId),
      milestoneData
    );

    res.json({
      success: true,
      message: 'Character milestone added successfully',
      data: updatedStoryArc,
    });
  } catch (error) {
    logger.error(`Error adding character milestone: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add character milestone',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/story-arcs/:storyArcId/world-state-changes
 * @desc Add a world state change to a story arc
 * @access Public
 */
router.post('/:storyArcId/world-state-changes', async (req, res) => {
  try {
    const { storyArcId } = req.params;
    const worldStateData = req.body;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const updatedStoryArc = await storyArcService.addWorldStateChange(
      new Types.ObjectId(storyArcId),
      worldStateData
    );

    res.json({
      success: true,
      message: 'World state change added successfully',
      data: updatedStoryArc,
    });
  } catch (error) {
    logger.error(`Error adding world state change: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add world state change',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route PUT /api/story-arcs/:storyArcId/quest-progress
 * @desc Update quest progress in a story arc
 * @access Public
 */
router.put('/:storyArcId/quest-progress', async (req, res) => {
  try {
    const { storyArcId } = req.params;
    const questProgressData = req.body;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const { questId, ...updates } = questProgressData;

    if (!questId) {
      return res.status(400).json({
        success: false,
        message: 'Quest ID is required',
      });
    }

    const success = await storyArcService.updateQuestProgress(
      new Types.ObjectId(storyArcId),
      new Types.ObjectId(questId),
      updates
    );

    res.json({
      success: true,
      message: success ? 'Quest progress updated successfully' : 'Quest not found',
      data: { success },
    });
  } catch (error) {
    logger.error(`Error updating quest progress: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update quest progress',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route PUT /api/story-arcs/:storyArcId/advance-chapter
 * @desc Advance to the next chapter in a story arc
 * @access Public
 */
router.put('/:storyArcId/advance-chapter', async (req, res) => {
  try {
    const { storyArcId } = req.params;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const updatedStoryArc = await storyArcService.advanceChapter(new Types.ObjectId(storyArcId));

    res.json({
      success: true,
      message: 'Chapter advanced successfully',
      data: updatedStoryArc,
    });
  } catch (error) {
    logger.error(`Error advancing chapter: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to advance chapter',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/story-arcs/:storyArcId/current-story-beat
 * @desc Get the current active story beat
 * @access Public
 */
router.get('/:storyArcId/current-story-beat', async (req, res) => {
  try {
    const { storyArcId } = req.params;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const currentStoryBeat = await storyArcService.getCurrentStoryBeat(
      new Types.ObjectId(storyArcId)
    );

    res.json({
      success: true,
      data: currentStoryBeat,
    });
  } catch (error) {
    logger.error(`Error getting current story beat: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get current story beat',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/story-arcs/:storyArcId/validate
 * @desc Validate story consistency for a story arc
 * @access Public
 */
router.post('/:storyArcId/validate', async (req, res) => {
  try {
    const { storyArcId } = req.params;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    logger.debug(`Validating story arc: ${storyArcId}`);
    const storyArc = await storyArcService.getStoryArcById(new Types.ObjectId(storyArcId));
    if (!storyArc) {
      return res.status(404).json({
        success: false,
        message: 'Story arc not found',
      });
    }

    logger.debug(
      `Story arc found, starting validation. StoryValidator instance: ${storyValidator ? 'exists' : 'undefined'}`
    );

    if (!storyValidator) {
      return res.status(500).json({
        success: false,
        message: 'Story validator not initialized',
      });
    }

    const validationResult = await storyValidator.validateStoryArc(storyArc);

    res.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    logger.error(`Error validating story arc: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to validate story arc',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/story-arcs/:storyArcId/progression
 * @desc Get story progression data and suggestions
 * @access Public
 */
router.get('/:storyArcId/progression', async (req, res) => {
  try {
    const { storyArcId } = req.params;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const storyArc = await storyArcService.getStoryArcByCampaignId(new Types.ObjectId(storyArcId));
    if (!storyArc) {
      return res.status(404).json({
        success: false,
        message: 'Story arc not found',
      });
    }

    const progressionData = await storyProgression.getChapterProgressionData(storyArc);

    res.json({
      success: true,
      data: progressionData,
    });
  } catch (error) {
    logger.error(`Error getting story progression: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get story progression',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/story-arcs/:storyArcId/suggestions
 * @desc Generate story beat suggestions
 * @access Public
 */
router.post('/:storyArcId/suggestions', async (req, res) => {
  try {
    const { storyArcId } = req.params;
    const { count = 3 } = req.body;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    const storyArc = await storyArcService.getStoryArcByCampaignId(new Types.ObjectId(storyArcId));
    if (!storyArc) {
      return res.status(404).json({
        success: false,
        message: 'Story arc not found',
      });
    }

    // Build the story beat generation request
    const request = {
      campaignId: storyArc.campaignId,
      chapter: storyArc.currentChapter,
      act: storyArc.currentAct,
      context: `Theme: ${storyArc.theme}, Current Phase: ${storyArc.storyPhase}`,
      characters: [], // TODO: Get characters from campaign
      location: 'Current adventure location', // TODO: Get from current context
      previousBeats: storyArc.storyBeats.filter(beat => beat.completed),
      worldState: `Chapter ${storyArc.currentChapter}, Act ${storyArc.currentAct}`,
    };

    const suggestions = await storyProgression.generateStoryBeatSuggestions(request, count);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error(`Error generating story suggestions: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate story suggestions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route DELETE /api/story-arcs/:storyArcId
 * @desc Delete a story arc
 * @access Public
 */
router.delete('/:storyArcId', async (req, res) => {
  try {
    const { storyArcId } = req.params;

    if (!Types.ObjectId.isValid(storyArcId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story arc ID format',
      });
    }

    await storyArcService.deleteStoryArc(new Types.ObjectId(storyArcId));

    res.json({
      success: true,
      message: 'Story arc deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting story arc: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story arc',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
