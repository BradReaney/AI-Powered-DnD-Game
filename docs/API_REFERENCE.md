# 🔌 API Reference

Complete API documentation for the AI-Powered D&D Game backend services.

## 🌐 Base Information

- **Base URL**: `http://localhost:5001` (development) / `https://yourdomain.com` (production)
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer tokens

## 🔐 Authentication

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Register

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Verify Token

```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

## 🏰 Campaigns

### Get All Campaigns

```http
GET /api/campaigns
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `theme` (optional): Filter by theme
- `status` (optional): Filter by status (active, completed, paused)

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "The Lost Mines of Phandelver",
      "description": "A classic D&D adventure...",
      "theme": "fantasy",
      "difficulty": "medium",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Campaign by ID

```http
GET /api/campaigns/:campaignId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_id",
    "name": "The Lost Mines of Phandelver",
    "description": "A classic D&D adventure...",
    "theme": "fantasy",
    "difficulty": "medium",
    "status": "active",
    "settings": {
      "worldSize": "medium",
      "magicLevel": "medium",
      "technologyLevel": "medieval"
    },
    "characters": ["character_id_1", "character_id_2"],
    "sessions": ["session_id_1", "session_id_2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Campaign

```http
POST /api/campaigns
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Campaign",
  "description": "Campaign description",
  "theme": "fantasy",
  "difficulty": "medium",
  "sessionLength": 120,
  "settings": {
    "worldSize": "medium",
    "magicLevel": "medium",
    "technologyLevel": "medieval",
    "politicalStructure": "monarchy"
  }
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "new_campaign_id",
    "name": "New Campaign",
    "description": "Campaign description",
    "theme": "fantasy",
    "difficulty": "medium",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Campaign

```http
PUT /api/campaigns/:campaignId
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "difficulty": "hard"
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "campaign_id",
    "name": "Updated Campaign Name",
    "description": "Updated description",
    "difficulty": "hard",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete Campaign

```http
DELETE /api/campaigns/:campaignId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

## 👥 Characters

### Get All Characters

```http
GET /api/characters
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `type` (optional): Filter by type (player, npc, ai)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "characters": [
    {
      "id": "character_id",
      "name": "Gandalf",
      "type": "player",
      "race": "human",
      "class": "wizard",
      "level": 5,
      "campaignId": "campaign_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Character by ID

```http
GET /api/characters/:characterId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "character": {
    "id": "character_id",
    "name": "Gandalf",
    "type": "player",
    "race": "human",
    "class": "wizard",
    "level": 5,
    "abilityScores": {
      "strength": 10,
      "dexterity": 14,
      "constitution": 12,
      "intelligence": 18,
      "wisdom": 16,
      "charisma": 14
    },
    "hitPoints": {
      "current": 32,
      "maximum": 32,
      "temporary": 0
    },
    "armorClass": 15,
    "initiative": 2,
    "skills": {
      "acrobatics": 2,
      "arcana": 7,
      "athletics": 0,
      "deception": 2,
      "history": 7,
      "insight": 3,
      "intimidation": 2,
      "investigation": 7,
      "medicine": 3,
      "nature": 7,
      "perception": 3,
      "performance": 2,
      "persuasion": 2,
      "religion": 7,
      "sleightOfHand": 2,
      "stealth": 2,
      "survival": 3
    },
    "inventory": [
      {
        "name": "Staff of Power",
        "type": "weapon",
        "damage": "1d6+1",
        "properties": ["versatile"]
      }
    ],
    "spells": [
      {
        "name": "Fireball",
        "level": 3,
        "school": "evocation",
        "castingTime": "1 action",
        "range": "150 feet",
        "components": ["V", "S", "M"],
        "duration": "Instantaneous"
      }
    ],
    "campaignId": "campaign_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Character

```http
POST /api/characters
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Character",
  "type": "player",
  "race": "elf",
  "class": "ranger",
  "level": 1,
  "campaignId": "campaign_id",
  "abilityScores": {
    "strength": 14,
    "dexterity": 16,
    "constitution": 12,
    "intelligence": 10,
    "wisdom": 14,
    "charisma": 8
  },
  "background": "outlander",
  "personality": "Brave and adventurous"
}
```

**Response:**
```json
{
  "success": true,
  "character": {
    "id": "new_character_id",
    "name": "New Character",
    "type": "player",
    "race": "elf",
    "class": "ranger",
    "level": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Character

```http
PUT /api/characters/:characterId
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "level": 6,
  "hitPoints": {
    "current": 45,
    "maximum": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "character": {
    "id": "character_id",
    "level": 6,
    "hitPoints": {
      "current": 45,
      "maximum": 45
    },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete Character

```http
DELETE /api/characters/:characterId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Character deleted successfully"
}
```

## 🎮 Gameplay

### Get Story Response

```http
POST /api/gameplay/story-response
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "campaignId": "campaign_id",
  "sessionId": "session_id",
  "message": "I look around the tavern",
  "characterId": "character_id",
  "context": {
    "location": "The Prancing Pony",
    "time": "evening",
    "weather": "clear"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "text": "As you look around the tavern, you see...",
    "aiModel": "gemini-2.5-flash",
    "responseTime": 1200,
    "quality": 0.85,
    "suggestions": [
      "Ask the bartender about local rumors",
      "Check the notice board for jobs",
      "Look for suspicious characters"
    ]
  }
}
```

### Perform Skill Check

```http
POST /api/gameplay/skill-check
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "characterId": "character_id",
  "skill": "perception",
  "difficulty": 15,
  "advantage": false,
  "disadvantage": false,
  "modifiers": 2
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "skill": "perception",
    "roll": 17,
    "total": 19,
    "difficulty": 15,
    "success": true,
    "critical": false,
    "message": "You successfully notice the hidden door in the wall."
  }
}
```

### Combat Actions

```http
POST /api/combat/action
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session_id",
  "characterId": "character_id",
  "action": "attack",
  "target": "enemy_id",
  "weapon": "longsword",
  "spell": null,
  "movement": {
    "from": {"x": 5, "y": 5},
    "to": {"x": 6, "y": 5}
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "action": "attack",
    "attackRoll": 18,
    "attackTotal": 20,
    "hit": true,
    "damage": 8,
    "damageType": "slashing",
    "target": {
      "id": "enemy_id",
      "name": "Goblin",
      "currentHP": 2,
      "status": "bloodied"
    },
    "message": "Your longsword strikes true, dealing 8 slashing damage to the goblin!"
  }
}
```

## 🗺️ Locations

### Get All Locations

```http
GET /api/locations
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `type` (optional): Filter by type (city, dungeon, wilderness)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "locations": [
    {
      "id": "location_id",
      "name": "Waterdeep",
      "type": "city",
      "description": "The City of Splendors...",
      "campaignId": "campaign_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Location by ID

```http
GET /api/locations/:locationId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "location": {
    "id": "location_id",
    "name": "Waterdeep",
    "type": "city",
    "description": "The City of Splendors...",
    "size": "large",
    "population": "inhabited",
    "dangerLevel": "safe",
    "features": [
      "Grand Market",
      "Castle Waterdeep",
      "Dock Ward"
    ],
    "npcs": ["npc_id_1", "npc_id_2"],
    "campaignId": "campaign_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Location

```http
POST /api/locations
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Location",
  "type": "dungeon",
  "description": "A mysterious underground complex...",
  "size": "medium",
  "population": "abandoned",
  "dangerLevel": "dangerous",
  "campaignId": "campaign_id"
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "id": "new_location_id",
    "name": "New Location",
    "type": "dungeon",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📊 Sessions

### Get All Sessions

```http
GET /api/sessions
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `status` (optional): Filter by status (active, completed, paused)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_id",
      "campaignId": "campaign_id",
      "name": "Session 1: The Beginning",
      "status": "active",
      "startTime": "2024-01-01T18:00:00.000Z",
      "duration": 120,
      "participants": ["character_id_1", "character_id_2"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Session by ID

```http
GET /api/sessions/:sessionId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_id",
    "campaignId": "campaign_id",
    "name": "Session 1: The Beginning",
    "status": "active",
    "startTime": "2024-01-01T18:00:00.000Z",
    "duration": 120,
    "participants": ["character_id_1", "character_id_2"],
    "events": [
      {
        "type": "story",
        "timestamp": "2024-01-01T18:05:00.000Z",
        "description": "The party enters the tavern..."
      }
    ],
    "analytics": {
      "playerEngagement": 0.85,
      "aiResponseTime": 1200,
      "combatRounds": 3,
      "storyProgress": 0.25
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Session

```http
POST /api/sessions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "campaignId": "campaign_id",
  "name": "New Session",
  "participants": ["character_id_1", "character_id_2"],
  "location": "The Prancing Pony",
  "weather": "clear",
  "time": "evening"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "new_session_id",
    "campaignId": "campaign_id",
    "name": "New Session",
    "status": "active",
    "startTime": "2024-01-01T18:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### End Session

```http
PUT /api/sessions/:sessionId/end
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "endTime": "2024-01-01T20:00:00.000Z",
  "summary": "The party successfully completed their first quest",
  "playerFeedback": {
    "difficulty": "medium",
    "enjoyment": 4,
    "comments": "Great session!"
  }
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_id",
    "status": "completed",
    "endTime": "2024-01-01T20:00:00.000Z",
    "duration": 120,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔍 Quests

### Get All Quests

```http
GET /api/quests
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `status` (optional): Filter by status (active, completed, failed)
- `type` (optional): Filter by type (main, side, daily)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "quests": [
    {
      "id": "quest_id",
      "title": "The Missing Merchant",
      "description": "Find the missing merchant...",
      "type": "main",
      "status": "active",
      "campaignId": "campaign_id",
      "objectives": [
        {
          "id": "objective_id",
          "description": "Investigate the merchant's last known location",
          "completed": false
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Quest by ID

```http
GET /api/quests/:questId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "id": "quest_id",
    "title": "The Missing Merchant",
    "description": "Find the missing merchant...",
    "type": "main",
    "status": "active",
    "campaignId": "campaign_id",
    "objectives": [
      {
        "id": "objective_id",
        "description": "Investigate the merchant's last known location",
        "completed": false,
        "completedAt": null
      }
    ],
    "rewards": {
      "experience": 300,
      "gold": 50,
      "items": ["magic_sword_id"]
    },
    "timeLimit": null,
    "difficulty": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Quest

```http
POST /api/quests
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "campaignId": "campaign_id",
  "title": "New Quest",
  "description": "Quest description...",
  "type": "side",
  "objectives": [
    {
      "description": "First objective"
    },
    {
      "description": "Second objective"
    }
  ],
  "rewards": {
    "experience": 200,
    "gold": 25
  },
  "difficulty": "easy"
}
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "id": "new_quest_id",
    "title": "New Quest",
    "type": "side",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Quest Progress

```http
PUT /api/quests/:questId/progress
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "objectiveId": "objective_id",
  "completed": true,
  "notes": "Found the merchant's wagon in the forest"
}
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "id": "quest_id",
    "objectives": [
      {
        "id": "objective_id",
        "completed": true,
        "completedAt": "2024-01-01T19:30:00.000Z"
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🤖 AI Integration

### Get AI Models

```http
GET /api/ai/models
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "gemini-2.5-flash-lite",
      "name": "Gemini 2.5 Flash Lite",
      "type": "fast",
      "maxTokens": 8192,
      "capabilities": ["basic", "skill-checks", "simple-responses"]
    },
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash",
      "type": "balanced",
      "maxTokens": 8192,
      "capabilities": ["character-generation", "combat", "moderate-complexity"]
    },
    {
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro",
      "type": "advanced",
      "maxTokens": 8192,
      "capabilities": ["story-generation", "world-building", "complex-tasks"]
    }
  ]
}
```

### Get AI Performance

```http
GET /api/ai/performance
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date for performance data
- `endDate` (optional): End date for performance data
- `model` (optional): Filter by specific AI model

**Response:**
```json
{
  "success": true,
  "performance": {
    "totalRequests": 1250,
    "averageResponseTime": 1450,
    "successRate": 0.98,
    "modelUsage": {
      "gemini-2.5-flash-lite": 450,
      "gemini-2.5-flash": 600,
      "gemini-2.5-pro": 200
    },
    "qualityMetrics": {
      "averageQuality": 0.87,
      "qualityDistribution": {
        "excellent": 0.45,
        "good": 0.35,
        "fair": 0.15,
        "poor": 0.05
      }
    }
  }
}
```

## 📈 Analytics

### Get Campaign Analytics

```http
GET /api/analytics/campaign/:campaignId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `groupBy` (optional): Group by day, week, month (default: day)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "campaignId": "campaign_id",
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.000Z"
    },
    "sessions": {
      "total": 8,
      "averageDuration": 135,
      "totalPlayTime": 1080
    },
    "playerEngagement": {
      "average": 0.82,
      "trend": "increasing"
    },
    "storyProgress": {
      "current": 0.65,
      "milestones": [
        {
          "name": "First Quest Completed",
          "date": "2024-01-15T00:00:00.000Z",
          "progress": 0.25
        }
      ]
    },
    "aiPerformance": {
      "averageResponseTime": 1420,
      "averageQuality": 0.89,
      "modelEfficiency": 0.94
    }
  }
}
```

### Get User Analytics

```http
GET /api/analytics/user
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
```json
{
  "success": true,
  "analytics": {
    "userId": "user_id",
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.000Z"
    },
    "campaigns": {
      "total": 3,
      "active": 2,
      "completed": 1
    },
    "characters": {
      "total": 5,
      "highestLevel": 8,
      "totalExperience": 12500
    },
    "sessions": {
      "total": 24,
      "totalPlayTime": 3240,
      "averageSessionLength": 135
    },
    "achievements": [
      {
        "name": "First Campaign",
        "description": "Created your first campaign",
        "earnedAt": "2024-01-05T00:00:00.000Z"
      }
    ]
  }
}
```

## 🏥 Health Check

### Service Health

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "mongodb": "healthy",
    "redis": "healthy",
    "ai": "healthy"
  },
  "version": "1.0.0"
}
```

## ⚠️ Error Handling

### Error Response Format

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

### Rate Limiting

- **Default Limit**: 100 requests per 15 minutes
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## 🔒 Security

### Authentication

- JWT tokens with configurable expiration
- Secure password hashing
- Session management
- CSRF protection

### Authorization

- Role-based access control
- Resource ownership validation
- Campaign membership verification

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure headers (Helmet.js)

---

**For additional help, see the [User Guide](USER_GUIDE.md) or [Troubleshooting Guide](TROUBLESHOOTING.md).**
