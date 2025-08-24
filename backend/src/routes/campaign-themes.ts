import express from 'express';
import logger from '../services/LoggerService';
import CampaignThemeService from '../services/CampaignThemeService';

const router = express.Router();
const campaignThemeService = new CampaignThemeService();

// Get all available campaign themes
router.get('/', async (_req, res) => {
  try {
    const themes = campaignThemeService.getAllThemes();
    return res.json({
      success: true,
      themes,
      count: themes.length,
      message: 'Campaign themes retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting campaign themes:', error);
    return res.status(500).json({
      error: 'Failed to get campaign themes',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a specific theme by ID
router.get('/:themeId', async (req, res) => {
  try {
    const { themeId } = req.params;
    const theme = campaignThemeService.getTheme(themeId);

    if (!theme) {
      return res.status(404).json({ error: 'Campaign theme not found' });
    }

    return res.json({
      success: true,
      theme,
      message: 'Campaign theme retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting campaign theme:', error);
    return res.status(500).json({
      error: 'Failed to get campaign theme',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get themes by genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const themes = campaignThemeService.getThemesByGenre(genre);

    return res.json({
      success: true,
      themes,
      genre,
      count: themes.length,
      message: `Campaign themes for ${genre} genre retrieved successfully`,
    });
  } catch (error) {
    logger.error('Error getting themes by genre:', error);
    return res.status(500).json({
      error: 'Failed to get themes by genre',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get themes by difficulty
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const themes = campaignThemeService.getThemesByDifficulty(difficulty);

    return res.json({
      success: true,
      themes,
      difficulty,
      count: themes.length,
      message: `Campaign themes for ${difficulty} difficulty retrieved successfully`,
    });
  } catch (error) {
    logger.error('Error getting themes by difficulty:', error);
    return res.status(500).json({
      error: 'Failed to get themes by difficulty',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get themes suitable for a specific level range
router.get('/levels/:minLevel/:maxLevel', async (req, res) => {
  try {
    const { minLevel, maxLevel } = req.params;
    const min = parseInt(minLevel);
    const max = parseInt(maxLevel);

    if (isNaN(min) || isNaN(max) || min < 1 || max > 20 || min > max) {
      return res.status(400).json({ error: 'Invalid level range' });
    }

    const themes = campaignThemeService.getThemesByLevel(min, max);

    return res.json({
      success: true,
      themes,
      levelRange: { min, max },
      count: themes.length,
      message: `Campaign themes for levels ${min}-${max} retrieved successfully`,
    });
  } catch (error) {
    logger.error('Error getting themes by level range:', error);
    return res.status(500).json({
      error: 'Failed to get themes by level range',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Generate a custom scenario using AI
router.post('/:themeId/generate-scenario', async (req, res) => {
  try {
    const { themeId } = req.params;
    const { partyLevel, partySize, customElements = [] } = req.body;

    // Validate required fields
    if (!partyLevel || !partySize) {
      return res.status(400).json({
        error: 'Missing required fields: partyLevel, partySize',
      });
    }

    // Validate party level and size
    if (partyLevel < 1 || partyLevel > 20) {
      return res.status(400).json({ error: 'Party level must be between 1 and 20' });
    }

    if (partySize < 1 || partySize > 8) {
      return res.status(400).json({ error: 'Party size must be between 1 and 8' });
    }

    const scenario = await campaignThemeService.generateCustomScenario(
      themeId,
      partyLevel,
      partySize,
      customElements
    );

    return res.json({
      success: true,
      scenario,
      message: 'Custom scenario generated successfully',
    });
  } catch (error) {
    logger.error('Error generating custom scenario:', error);
    return res.status(500).json({
      error: 'Failed to generate custom scenario',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a random scenario template for a theme
router.get('/:themeId/random-scenario', async (req, res) => {
  try {
    const { themeId } = req.params;
    const scenario = campaignThemeService.getRandomScenarioTemplate(themeId);

    if (!scenario) {
      return res.status(404).json({ error: 'No scenario templates available for this theme' });
    }

    return res.json({
      success: true,
      scenario,
      message: 'Random scenario template retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting random scenario template:', error);
    return res.status(500).json({
      error: 'Failed to get random scenario template',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Validate theme consistency for an existing campaign
router.post('/:themeId/validate-consistency', async (req, res) => {
  try {
    const { themeId } = req.params;
    const { campaignElements } = req.body;

    if (!campaignElements || !Array.isArray(campaignElements)) {
      return res.status(400).json({
        error: 'Missing or invalid campaignElements array',
      });
    }

    const validation = campaignThemeService.validateThemeConsistency(themeId, campaignElements);

    return res.json({
      success: true,
      validation,
      message: 'Theme consistency validation completed',
    });
  } catch (error) {
    logger.error('Error validating theme consistency:', error);
    return res.status(500).json({
      error: 'Failed to validate theme consistency',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get theme statistics
router.get('/stats/overview', async (_req, res) => {
  try {
    const themes = campaignThemeService.getAllThemes();

    // Calculate statistics
    const genreStats: Record<string, number> = {};
    const difficultyStats: Record<string, number> = {};
    const totalScenarios = themes.reduce((sum, theme) => sum + theme.scenarioTemplates.length, 0);

    themes.forEach(theme => {
      genreStats[theme.genre] = (genreStats[theme.genre] || 0) + 1;
      difficultyStats[theme.difficulty] = (difficultyStats[theme.difficulty] || 0) + 1;
    });

    const stats = {
      totalThemes: themes.length,
      totalScenarios,
      genreDistribution: genreStats,
      difficultyDistribution: difficultyStats,
      averageScenariosPerTheme: Math.round((totalScenarios / themes.length) * 100) / 100,
    };

    return res.json({
      success: true,
      stats,
      message: 'Theme statistics retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting theme statistics:', error);
    return res.status(500).json({
      error: 'Failed to get theme statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
