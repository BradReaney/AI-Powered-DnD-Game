# AI-Powered D&D Game - Postman Testing Guide

This directory contains comprehensive Postman collections and environments for testing all endpoints in the AI-Powered D&D Game application.

## Files Overview

### Collections
- **`AI-Powered-DnD-Game.postman_collection.json`** - Complete API collection with all endpoints organized by feature

### Environments
- **`Local-Development.postman_environment.json`** - For local development testing
- **`Testing.postman_environment.json`** - For automated testing scenarios
- **`Production.postman_environment.json`** - For production environment testing

## Quick Start

### 1. Import into Postman
1. Open Postman
2. Click "Import" button
3. Select all files in this directory:
   - `AI-Powered-DnD-Game.postman_collection.json`
   - `Local-Development.postman_environment.json`
   - `Testing.postman_environment.json`
   - `Production.postman_environment.json`

### 2. Set Up Environment
1. Select the "Local Development" environment from the environment dropdown
2. Verify the `baseUrl` is set to `http://localhost:5001`

### 3. Start Your Application
Make sure your application is running using Docker Compose:
```bash
docker-compose up
```

The application will be available at:
- **Backend API**: http://localhost:5001
- **Frontend**: http://localhost:3000
- **Mock LLM Service**: http://localhost:5002

## Testing Workflow

### Recommended Testing Order

1. **Health & System** - Verify the application is running
2. **Campaigns** - Create a test campaign
3. **Characters** - Create characters for the campaign
4. **Sessions** - Create and manage game sessions
5. **Gameplay** - Test core gameplay mechanics
6. **Combat** - Test combat encounters
7. **Locations** - Test location management
8. **Quests** - Test quest system
9. **Character Development** - Test character progression
10. **Campaign Themes** - Test theme system
11. **AI Analytics** - Test analytics endpoints
12. **Story Arcs** - Test story arc management

### Automated Variable Management

The collection includes automatic variable management:
- When you create a campaign, the `campaignId` is automatically set
- When you create a character, the `characterId` is automatically set
- When you create a session, the `sessionId` is automatically set

This allows you to run requests in sequence without manually copying IDs.

## Endpoint Categories

### Health & System (5 endpoints)
- Health checks (light and full)
- Cache performance monitoring
- Cache management (clear, warm)

### Campaigns (5 endpoints)
- CRUD operations for campaigns
- Campaign statistics and character lists

### Characters (7 endpoints)
- Character CRUD operations
- Character management by campaign/session
- Character skill, spell, and equipment updates

### Sessions (13 endpoints)
- Session lifecycle management
- Message handling
- AI response generation
- Session state management

### Gameplay (5 endpoints)
- Skill checks and dice rolling
- AI response generation
- Context and prompt template management

### Combat (5 endpoints)
- Combat encounter management
- Participant management
- Combat state tracking

### Locations (3 endpoints)
- Location CRUD operations
- Campaign-specific locations

### Quests (3 endpoints)
- Quest CRUD operations
- Campaign-specific quests

### Character Development (4 endpoints)
- Character progression tracking
- Skill, spell, and equipment management

### Campaign Themes (2 endpoints)
- Theme management
- Theme retrieval

### AI Analytics (3 endpoints)
- Analytics by campaign and session
- Overall analytics

### Story Arcs (3 endpoints)
- Story arc CRUD operations
- Campaign-specific story arcs

## Testing Tips

### 1. Use the Testing Environment
For automated testing, use the "Testing" environment which includes:
- Predefined test data names
- Consistent test user IDs
- Test-specific configurations

### 2. Run Collection Runner
1. Select the collection
2. Click "Run" button
3. Choose the "Testing" environment
4. Run all requests to test the full workflow

### 3. Monitor Response Times
The collection includes test scripts that log response times for performance monitoring.

### 4. Check Response Status Codes
All requests include basic validation to ensure proper HTTP status codes.

### 5. Validate Response Structure
Test scripts validate that responses contain expected fields and data types.

## Environment Variables

### Local Development
- `baseUrl`: http://localhost:5001
- `frontendUrl`: http://localhost:3000
- `mockLlmUrl`: http://localhost:5002
- `userId`: test-user-123

### Testing
- `baseUrl`: http://localhost:5001
- `testCampaignName`: API Test Campaign
- `testCharacterName`: Test Character
- `testSessionTitle`: API Test Session

### Production
- `baseUrl`: https://your-production-domain.com
- `authToken`: your-jwt-token-here (if authentication is required)

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Docker Compose is running
   - Check that the backend is accessible at http://localhost:5001

2. **404 Not Found**
   - Verify the endpoint URL is correct
   - Check that the route exists in the backend

3. **500 Internal Server Error**
   - Check the backend logs
   - Verify database connectivity
   - Check environment variables

4. **Variable Not Set**
   - Ensure you're running requests in the correct order
   - Check that previous requests completed successfully
   - Verify the test scripts are setting variables correctly

### Debug Mode
Enable debug mode in Postman to see detailed request/response information:
1. Go to Postman Settings
2. Enable "Show Postman Console"
3. Check the console for detailed logs

## Advanced Usage

### Custom Test Scripts
You can add custom test scripts to any request. Example:
```javascript
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.expect(jsonData).to.have.property('name');
});
```

### Data-Driven Testing
Use CSV files with the Collection Runner for data-driven testing:
1. Create a CSV file with test data
2. Use variables like `{{csvFieldName}}` in requests
3. Run the collection with the CSV file

### Mock Server
Create a mock server from the collection for frontend development:
1. Right-click the collection
2. Select "Mock Collection"
3. Configure mock responses
4. Use the mock URL for frontend development

## Contributing

When adding new endpoints:
1. Add them to the appropriate folder in the collection
2. Include proper test scripts
3. Update this README with the new endpoint information
4. Add any new environment variables if needed

## Support

For issues with the API or testing setup:
1. Check the application logs
2. Verify Docker Compose is running correctly
3. Ensure all environment variables are set
4. Check the backend route definitions
