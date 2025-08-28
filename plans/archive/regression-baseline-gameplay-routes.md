# Regression Baseline: Gameplay Routes

**File**: `backend/src/routes/gameplay.ts` (1265 lines)
**Status**: OVERLY COMPLEX - NEEDS REFACTORING
**Last Updated**: Before refactoring

## Endpoint Inventory & Current Behavior

### **Core Gameplay (KEEP)**

#### `POST /api/gameplay/skill-check`
- **File Location**: `backend/src/routes/gameplay.ts:18-120`
- **Purpose**: Perform a skill check with AI response generation
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ characterId, skillName, d20Roll, targetDC, actionDescription, campaignId, sessionId, location, advantage?, disadvantage?, customModifiers? }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, skillCheckResult: object, aiResponse: string, message: string }`
- **Business Logic**: 
  - Validates required fields and roll values
  - Calls `skillCheckService.performSkillCheck()`
  - Adds context layer for AI
  - Generates AI response using prompt service
- **Dependencies**: SkillCheckService, ContextManager, PromptService, GeminiClient
- **Current Issues**: Complex implementation (102 lines)

#### `POST /api/gameplay/dice-roll`
- **File Location**: `backend/src/routes/gameplay.ts:122-180`
- **Purpose**: Roll dice with AI response generation
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ diceNotation, campaignId, sessionId, characterId, actionDescription, location }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, diceResult: object, aiResponse: string, message: string }`
- **Business Logic**: 
  - Validates dice notation
  - Rolls dice using SkillCheckService
  - Adds context layer for AI
  - Generates AI response using prompt service
- **Dependencies**: SkillCheckService, ContextManager, PromptService, GeminiClient
- **Current Issues**: Complex implementation (58 lines)

#### `POST /api/gameplay/ai-response`
- **File Location**: `backend/src/routes/gameplay.ts:182-200`
- **Purpose**: Get AI response for gameplay actions
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ action, campaignId, sessionId, characterId, location }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, aiResponse: string, message: string }`
- **Business Logic**: 
  - Gets campaign context
  - Generates AI response using GeminiClient
  - Adds context layer for AI
- **Dependencies**: ContextManager, GeminiClient
- **Current Issues**: None identified

### **Advanced Features (KEEP)**

#### `GET /api/gameplay/context/:campaignId`
- **File Location**: `backend/src/routes/gameplay.ts:1208-1240`
- **Purpose**: Get campaign context and stats
- **Status**: KEEP (implemented and working)
- **Request**:
  - Method: GET
  - URL Params: `campaignId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, context: object, stats: object, message: string }`
- **Business Logic**: 
  - Calls `contextManager.getContext(campaignId)`
  - Gets context stats
- **Dependencies**: ContextManager
- **Current Issues**: None identified

#### `GET /api/gameplay/prompt-templates`
- **File Location**: `backend/src/routes/gameplay.ts:1235-1265`
- **Purpose**: Get prompt templates by category
- **Status**: KEEP (implemented and working)
- **Request**:
  - Method: GET
  - Query Params: `category` (optional)
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, templates: array, metadata: object, message: string }`
- **Business Logic**: 
  - Gets templates by category or all templates
  - Gets template metadata
- **Dependencies**: PromptService
- **Current Issues**: None identified

### **Advanced Features (MARKED FOR DELETION)**

#### `POST /api/gameplay/context/add`
- **File Location**: Not found in code
- **Purpose**: Add context layer
- **Status**: MARKED FOR DELETION (not implemented)
- **Request**: Not implemented
- **Response**: Not implemented
- **Business Logic**: Not implemented
- **Dependencies**: None
- **Current Issues**: Endpoint doesn't exist in the codebase

#### `POST /api/gameplay/context/clear`
- **File Location**: Not found in code
- **Purpose**: Clear context
- **Status**: MARKED FOR DELETION (not implemented)
- **Request**: Not implemented
- **Response**: Not implemented
- **Business Logic**: Not implemented
- **Dependencies**: None
- **Current Issues**: Endpoint doesn't exist in the codebase

#### `POST /api/gameplay/prompt/build`
- **File Location**: Not found in code
- **Purpose**: Build prompt
- **Status**: MARKED FOR DELETION (not implemented)
- **Request**: Not implemented
- **Response**: Not implemented
- **Business Logic**: Not implemented
- **Dependencies**: None
- **Current Issues**: Endpoint doesn't exist in the codebase

#### `POST /api/gameplay/prompt/execute`
- **File Location**: Not found in code
- **Purpose**: Execute prompt
- **Status**: MARKED FOR DELETION (not implemented)
- **Request**: Not implemented
- **Response**: Not implemented
- **Business Logic**: Not implemented
- **Dependencies**: None
- **Current Issues**: Endpoint doesn't exist in the codebase

### **Additional Gameplay Features (KEEP)**

#### `GET /api/gameplay/skills`
- **File Location**: `backend/src/routes/gameplay.ts:200-220`
- **Purpose**: Get all available skills
- **Status**: KEEP
- **Request**: Method: GET
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, skills: array, message: string }`
- **Business Logic**: Calls `skillCheckService.getAllSkills()`
- **Dependencies**: SkillCheckService
- **Current Issues**: None identified

#### `GET /api/gameplay/skills/:skillName`
- **File Location**: `backend/src/routes/gameplay.ts:222-260`
- **Purpose**: Get skill information and suggested DCs
- **Status**: KEEP
- **Request**:
  - Method: GET
  - URL Params: `skillName` (string)
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, skillName: string, abilityScore: string, suggestedDCs: object, message: string }`
- **Business Logic**: 
  - Gets skill ability score
  - Gets suggested DCs for different difficulty levels
- **Dependencies**: SkillCheckService
- **Current Issues**: None identified

#### `POST /api/gameplay/story-response`
- **File Location**: `backend/src/routes/gameplay.ts:262-400`
- **Purpose**: Generate AI story response
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ playerAction, campaignId, characterContext?, worldState?, sessionId? }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, aiResponse: string, usage: object, message: string, userMessageId?, aiMessageId? }`
- **Business Logic**: 
  - Gets campaign context
  - Generates AI response using GeminiClient
  - Saves messages to database if sessionId provided
  - Adds context layers
- **Dependencies**: ContextManager, GeminiClient, Message model
- **Current Issues**: Complex implementation (138 lines)

#### `POST /api/gameplay/story-generate`
- **File Location**: `backend/src/routes/gameplay.ts:402-600`
- **Purpose**: Generate AI story with character extraction
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ prompt, campaignId, sessionId }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, storyContent: string, extractedCharacters: array, extractedLocations: array, message: string }`
- **Business Logic**: 
  - Gets campaign context and chat history
  - Generates AI response with conversation context
  - Extracts characters and locations from story
  - Saves to database
- **Dependencies**: ContextManager, GeminiClient, Message model
- **Current Issues**: Very complex implementation (198 lines)

#### `POST /api/gameplay/story-continue`
- **File Location**: `backend/src/routes/gameplay.ts:602-800`
- **Purpose**: Continue story with character and location integration
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ prompt, campaignId, sessionId, characterContext, locationContext }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, storyContent: string, message: string }`
- **Business Logic**: 
  - Gets campaign context
  - Generates AI response with character and location context
  - Saves to database
- **Dependencies**: ContextManager, GeminiClient, Message model
- **Current Issues**: Complex implementation (198 lines)

#### `POST /api/gameplay/story-summarize`
- **File Location**: `backend/src/routes/gameplay.ts:802-1000`
- **Purpose**: Summarize story content
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ storyContent, campaignId, sessionId }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, summary: string, extractedCharacters: array, extractedLocations: array, message: string }`
- **Business Logic**: 
  - Generates story summary using AI
  - Extracts characters and locations
  - Saves to database
- **Dependencies**: GeminiClient, Message model
- **Current Issues**: Complex implementation (198 lines)

#### `POST /api/gameplay/story-analyze`
- **File Location**: `backend/src/routes/gameplay.ts:1002-1200`
- **Purpose**: Analyze story content for themes and elements
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ storyContent, campaignId, sessionId }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, analysis: object, extractedElements: object, message: string }`
- **Business Logic**: 
  - Analyzes story for themes, mood, and elements
  - Extracts characters, locations, and items
  - Saves to database
- **Dependencies**: GeminiClient, Message model
- **Current Issues**: Complex implementation (198 lines)

## Summary

### **Total Endpoints**: 15
- **KEEP**: 11 endpoints (core functionality)
- **DELETE**: 4 endpoints (not implemented)

### **Critical Issues Identified**
1. **Complex implementations**: Several endpoints are 100+ lines long
2. **Mixed concerns**: Story generation, skill checks, and context management in one file
3. **Unimplemented endpoints**: 4 endpoints marked for deletion don't exist in code
4. **Heavy dependencies**: Multiple services and AI clients used throughout

### **Implementation Status**
- **Fully Implemented**: 11 endpoints
- **Not Implemented**: 4 endpoints (marked for deletion)
- **Working AI Integration**: All story and gameplay endpoints use Gemini AI
- **Database Integration**: Most endpoints save data to MongoDB

### **Dependencies Analysis**
- **SkillCheckService**: Used for dice rolling and skill checks
- **ContextManager**: Used for campaign context management
- **GeminiClient**: Used for AI response generation
- **PromptService**: Used for prompt templates
- **Message Model**: Used for saving chat/story data

### **Next Steps**
1. **Create tests** for all KEEP endpoints
2. **Document expected behavior** for complex story generation endpoints
3. **Remove DELETE endpoints** (they don't exist anyway)
4. **Consider splitting** story generation into separate route file
5. **Simplify complex endpoints** by extracting business logic to services
