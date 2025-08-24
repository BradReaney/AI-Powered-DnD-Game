import express from 'express';
import { LocationService } from '../services/LocationService';
import logger from '../services/LoggerService';

const router = express.Router();
const locationService = new LocationService();

// Get all locations for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Validate campaignId
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID',
        details: 'Campaign ID is required and cannot be undefined',
      });
    }

    const locations = await locationService.getCampaignLocations(
      campaignId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error) {
    logger.error('Error getting campaign locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign locations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all locations for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const locations = await locationService.getSessionLocations(
      sessionId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error) {
    logger.error('Error getting session locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session locations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a specific location by ID
router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await locationService.getLocationById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      location,
    });
  } catch (error) {
    logger.error('Error getting location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create a new location
router.post('/', async (req, res) => {
  try {
    const locationData = req.body;

    // Validate required fields
    if (!locationData.name || !locationData.description || !locationData.campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, campaignId',
      });
    }

    const location = await locationService.createLocation(locationData);

    res.status(201).json({
      success: true,
      location,
      message: 'Location created successfully',
    });
  } catch (error) {
    logger.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update a location
router.put('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const updateData = req.body;

    const updatedLocation = await locationService.updateLocation(locationId, updateData);

    if (!updatedLocation) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      location: updatedLocation,
      message: 'Location updated successfully',
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark location as visited
router.post('/:locationId/visit', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { characterName } = req.body;

    if (!characterName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: characterName',
      });
    }

    const location = await locationService.markLocationAsVisited(locationId, characterName);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      location,
      message: 'Location marked as visited successfully',
    });
  } catch (error) {
    logger.error('Error marking location as visited:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark location as visited',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add occupant to location
router.post('/:locationId/occupants', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { characterName } = req.body;

    if (!characterName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: characterName',
      });
    }

    const location = await locationService.addOccupantToLocation(locationId, characterName);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      location,
      message: 'Occupant added to location successfully',
    });
  } catch (error) {
    logger.error('Error adding occupant to location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add occupant to location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Remove occupant from location
router.delete('/:locationId/occupants/:characterName', async (req, res) => {
  try {
    const { locationId, characterName } = req.params;

    const location = await locationService.removeOccupantFromLocation(locationId, characterName);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      location,
      message: 'Occupant removed from location successfully',
    });
  } catch (error) {
    logger.error('Error removing occupant from location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove occupant from location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get character's current location
router.get('/character/:characterName/current', async (req, res) => {
  try {
    const { characterName } = req.params;
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: campaignId',
      });
    }

    const location = await locationService.getCharacterCurrentLocation(
      characterName as string,
      campaignId as string
    );

    res.json({
      success: true,
      location,
    });
  } catch (error) {
    logger.error('Error getting character current location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character current location',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get character's location history
router.get('/character/:characterName/history', async (req, res) => {
  try {
    const { characterName } = req.params;
    const { campaignId, limit = 20 } = req.query;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: campaignId',
      });
    }

    const locations = await locationService.getCharacterLocationHistory(
      characterName,
      campaignId as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error) {
    logger.error('Error getting character location history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get character location history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search locations
router.post('/search', async (req, res) => {
  try {
    const { campaignId, searchCriteria, limit = 50, offset = 0 } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: campaignId',
      });
    }

    const locations = await locationService.searchLocations(
      campaignId,
      searchCriteria || {},
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error) {
    logger.error('Error searching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search locations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete a location
router.delete('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const deleted = await locationService.deleteLocation(locationId);

    if (deleted) {
      res.json({
        message: 'Location deleted successfully',
        locationId,
      });
    } else {
      res.status(404).json({
        error: 'Location not found',
        message: 'The specified location could not be found or was already deleted',
      });
    }
  } catch (error) {
    logger.error('Error deleting location:', error);
    res.status(500).json({
      error: 'Failed to delete location',
      message: 'An error occurred while deleting the location',
    });
  }
});

// Hard delete location (completely remove)
router.delete('/:locationId/hard', async (req, res) => {
  try {
    const { locationId } = req.params;
    const deleted = await locationService.deleteLocation(locationId);

    if (deleted) {
      res.json({
        message: 'Location and all related data deleted successfully',
        locationId,
      });
    } else {
      res.status(404).json({
        error: 'Location not found',
        message: 'The specified location could not be found or was already deleted',
      });
    }
  } catch (error) {
    logger.error('Error hard deleting location:', error);
    res.status(500).json({
      error: 'Failed to hard delete location',
      message: 'An error occurred while hard deleting the location',
    });
  }
});

export default router;
