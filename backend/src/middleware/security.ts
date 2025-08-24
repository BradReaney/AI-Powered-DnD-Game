import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../services/LoggerService';

/**
 * Input validation schemas for common operations
 */
const validationSchemas = {
  campaign: Joi.object({
    name: Joi.string().min(1).max(100).required().trim(),
    theme: Joi.string()
      .valid(
        'fantasy',
        'sci-fi',
        'horror',
        'mystery',
        'western',
        'cyberpunk',
        'steampunk',
        'post-apocalyptic',
        'medieval',
        'modern',
        'futuristic',
        'space',
        'underwater',
        'desert',
        'arctic',
        'tropical'
      )
      .required(),
    description: Joi.string().max(1000).optional().trim(),
    settings: Joi.object({
      difficulty: Joi.string().valid('easy', 'medium', 'hard', 'deadly').optional(),
      maxLevel: Joi.number().min(1).max(20).optional(),
      startingLevel: Joi.number().min(1).max(20).optional(),
      experienceRate: Joi.string().valid('slow', 'normal', 'fast').optional(),
      magicLevel: Joi.string().valid('low', 'medium', 'high').optional(),
      technologyLevel: Joi.string()
        .valid('primitive', 'medieval', 'renaissance', 'modern', 'futuristic')
        .optional(),
    }).optional(),
  }),

  character: Joi.object({
    name: Joi.string().min(1).max(100).required().trim(),
    characterType: Joi.string().valid('human', 'ai').required(),
    race: Joi.string().min(1).max(50).required().trim(),
    class: Joi.string().min(1).max(50).required().trim(),
    archetype: Joi.string().max(50).optional().trim(),
    level: Joi.number().min(1).max(20).required(),
    experience: Joi.number().min(0).required(),
    attributes: Joi.object({
      strength: Joi.number().min(3).max(18).required(),
      dexterity: Joi.number().min(3).max(18).required(),
      constitution: Joi.number().min(3).max(18).required(),
      intelligence: Joi.number().min(3).max(18).required(),
      wisdom: Joi.number().min(3).max(18).required(),
      charisma: Joi.number().min(3).max(18).required(),
    }).required(),
    hitPoints: Joi.object({
      maximum: Joi.number().min(1).required(),
      current: Joi.number().min(0).required(),
      temporary: Joi.number().min(0).optional(),
    }).required(),
    armorClass: Joi.number().min(10).required(),
    speed: Joi.number().min(0).required(),
  }),

  session: Joi.object({
    name: Joi.string().min(1).max(100).required().trim(),
    campaignId: Joi.string().required(),
    status: Joi.string().valid('active', 'paused', 'completed', 'archived').optional(),
    metadata: Joi.object({
      startTime: Joi.date().optional(),
      endTime: Joi.date().optional(),
      duration: Joi.number().min(0).optional(),
      players: Joi.array()
        .items(
          Joi.object({
            playerId: Joi.string().required(),
            characterId: Joi.string().required(),
            joinedAt: Joi.date().optional(),
          })
        )
        .optional(),
      dm: Joi.string().required(),
      location: Joi.string().max(100).optional(),
      weather: Joi.string().max(50).optional(),
      timeOfDay: Joi.string()
        .valid('dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight')
        .optional(),
    }).required(),
  }),

  quest: Joi.object({
    name: Joi.string().min(1).max(100).required().trim(),
    description: Joi.string().max(1000).required().trim(),
    objectives: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().max(500).required().trim(),
          completed: Joi.boolean().optional(),
        })
      )
      .min(1)
      .required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'deadly').required(),
    experienceReward: Joi.number().min(0).required(),
    timeLimit: Joi.date().optional(),
  }),

  combatAction: Joi.object({
    actionType: Joi.string()
      .valid(
        'attack',
        'move',
        'spell',
        'item',
        'dash',
        'dodge',
        'help',
        'hide',
        'ready',
        'search',
        'use object'
      )
      .required(),
    description: Joi.string().max(500).optional().trim(),
    participantId: Joi.string().required(),
    targetId: Joi.string().optional(),
    location: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required(),
    }).optional(),
  }),
};

/**
 * Generic validation middleware
 */
export const validate = (schemaName: keyof typeof validationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = validationSchemas[schemaName];

    if (!schema) {
      logger.error(`Validation schema not found: ${schemaName}`);
      return res.status(500).json({
        error: 'Validation Error',
        message: 'Internal validation error',
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn(`Validation failed for ${schemaName}:`, {
        path: req.path,
        method: req.method,
        errors: errorDetails,
      });

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errorDetails,
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Rate limiting for specific endpoints
 */
export const createRateLimiter = (windowMs: number, maxRequests: number, message?: string) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }

    const requestData = requests.get(ip);

    if (!requestData || now > requestData.resetTime) {
      // First request or window expired
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
    } else if (requestData.count < maxRequests) {
      // Within limit
      requestData.count++;
      next();
    } else {
      // Rate limit exceeded
      logger.warn(`Rate limit exceeded for IP: ${ip}`, {
        path: req.path,
        method: req.method,
        ip,
      });

      res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
      });
    }
  };
};

/**
 * Content type validation
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');

    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type Required',
        message: 'Content-Type header is required',
      });
    }

    const isValidType = allowedTypes.some(type => contentType.includes(type));

    if (!isValidType) {
      logger.warn(`Invalid content type: ${contentType}`, {
        path: req.path,
        method: req.method,
        contentType,
      });

      return res.status(400).json({
        error: 'Invalid Content-Type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Request size validation
 */
export const validateRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');

    if (contentLength > maxSize) {
      logger.warn(`Request too large: ${contentLength} bytes`, {
        path: req.path,
        method: req.method,
        contentLength,
        maxSize,
      });

      return res.status(413).json({
        error: 'Request Too Large',
        message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
      });
    }

    next();
  };
};

export default {
  validate,
  sanitizeInput,
  createRateLimiter,
  validateContentType,
  validateRequestSize,
};
