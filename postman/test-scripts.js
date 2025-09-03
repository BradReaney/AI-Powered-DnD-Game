// AI-Powered D&D Game - Postman Test Scripts
// Copy and paste these test scripts into your Postman requests

// ============================================================================
// COMMON TEST SCRIPTS
// ============================================================================

// Basic Response Validation
const basicResponseTests = `
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response time is less than 5000ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test('Response is JSON', function () {
    pm.response.to.be.json;
});

pm.test('Response has no errors', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.not.have.property('error');
});
`;

// Health Check Tests
const healthCheckTests = `
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response time is less than 1000ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

pm.test('Response has status field', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
});

pm.test('Health status is healthy', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.equal('healthy');
});
`;

// Campaign Creation Tests
const campaignCreationTests = `
pm.test('Status code is 201', function () {
    pm.response.to.have.status(201);
});

pm.test('Response has campaign ID', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.collectionVariables.set('campaignId', jsonData._id);
});

pm.test('Response has required fields', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('name');
    pm.expect(jsonData).to.have.property('theme');
    pm.expect(jsonData).to.have.property('description');
    pm.expect(jsonData).to.have.property('createdBy');
});

pm.test('Campaign name matches request', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.name).to.equal('Test Campaign');
});
`;

// Character Creation Tests
const characterCreationTests = `
pm.test('Status code is 201', function () {
    pm.response.to.have.status(201);
});

pm.test('Response has character ID', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.collectionVariables.set('characterId', jsonData._id);
});

pm.test('Response has required fields', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('name');
    pm.expect(jsonData).to.have.property('race');
    pm.expect(jsonData).to.have.property('class');
    pm.expect(jsonData).to.have.property('level');
    pm.expect(jsonData).to.have.property('campaignId');
});

pm.test('Character stats are valid', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('stats');
    pm.expect(jsonData.stats).to.have.property('strength');
    pm.expect(jsonData.stats.strength).to.be.a('number');
});
`;

// Session Creation Tests
const sessionCreationTests = `
pm.test('Status code is 201', function () {
    pm.response.to.have.status(201);
});

pm.test('Response has session ID', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.collectionVariables.set('sessionId', jsonData._id);
});

pm.test('Response has required fields', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('title');
    pm.expect(jsonData).to.have.property('campaignId');
    pm.expect(jsonData).to.have.property('participants');
    pm.expect(jsonData).to.have.property('gameMaster');
});

pm.test('Session is active', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData.status).to.equal('active');
});
`;

// AI Response Tests
const aiResponseTests = `
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has AI content', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('content');
    pm.expect(jsonData.content).to.be.a('string');
    pm.expect(jsonData.content.length).to.be.above(10);
});

pm.test('Response has metadata', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('timestamp');
    pm.expect(jsonData).to.have.property('model');
});
`;

// Dice Roll Tests
const diceRollTests = `
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has dice result', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('result');
    pm.expect(jsonData.result).to.be.a('number');
});

pm.test('Dice result is within valid range', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.result).to.be.at.least(1);
    pm.expect(jsonData.result).to.be.at.most(20);
});

pm.test('Response has dice notation', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('dice');
    pm.expect(jsonData.dice).to.equal('1d20');
});
`;

// Skill Check Tests
const skillCheckTests = `
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has skill check result', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.a('boolean');
});

pm.test('Response has roll details', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('roll');
    pm.expect(jsonData).to.have.property('modifier');
    pm.expect(jsonData).to.have.property('total');
});

pm.test('Total is calculated correctly', function () {
    const jsonData = pm.response.json();
    const expectedTotal = jsonData.roll + jsonData.modifier;
    pm.expect(jsonData.total).to.equal(expectedTotal);
});
`;

// Error Response Tests
const errorResponseTests = `
pm.test('Status code indicates error', function () {
    pm.expect(pm.response.code).to.be.oneOf([400, 401, 403, 404, 500]);
});

pm.test('Response has error message', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('error');
    pm.expect(jsonData.error).to.be.a('string');
});

pm.test('Error message is not empty', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.error.length).to.be.above(0);
});
`;

// Performance Tests
const performanceTests = `
pm.test('Response time is acceptable', function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});

pm.test('Response size is reasonable', function () {
    pm.expect(pm.response.responseSize).to.be.below(100000); // 100KB
});

pm.test('No memory leaks in response', function () {
    const jsonData = pm.response.json();
    pm.expect(JSON.stringify(jsonData).length).to.be.below(50000); // 50KB
});
`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate random test data
const generateTestData = `
// Generate random campaign name
const campaignName = 'Test Campaign ' + Math.floor(Math.random() * 1000);
pm.collectionVariables.set('randomCampaignName', campaignName);

// Generate random character name
const characterName = 'Test Character ' + Math.floor(Math.random() * 1000);
pm.collectionVariables.set('randomCharacterName', characterName);

// Generate random session title
const sessionTitle = 'Test Session ' + Math.floor(Math.random() * 1000);
pm.collectionVariables.set('randomSessionTitle', sessionTitle);
`;

// Clean up test data
const cleanupTests = `
// Log cleanup information
console.log('Cleaning up test data...');
console.log('Campaign ID:', pm.collectionVariables.get('campaignId'));
console.log('Character ID:', pm.collectionVariables.get('characterId'));
console.log('Session ID:', pm.collectionVariables.get('sessionId'));

// Clear variables after cleanup
pm.collectionVariables.unset('campaignId');
pm.collectionVariables.unset('characterId');
pm.collectionVariables.unset('sessionId');
`;

// ============================================================================
// COLLECTION-LEVEL SCRIPTS
// ============================================================================

// Pre-request script for collection
const collectionPreRequest = `
// Set common headers
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});

// Add timestamp for requests
pm.request.headers.add({
    key: 'X-Request-Timestamp',
    value: new Date().toISOString()
});

// Log request details
console.log('Making request to:', pm.request.url.toString());
console.log('Request method:', pm.request.method);
`;

// Post-response script for collection
const collectionPostResponse = `
// Log response details
console.log('Response status:', pm.response.code);
console.log('Response time:', pm.response.responseTime + 'ms');
console.log('Response size:', pm.response.responseSize + ' bytes');

// Store response time for performance analysis
const responseTime = pm.response.responseTime;
pm.collectionVariables.set('lastResponseTime', responseTime);

// Track total response time
const totalTime = pm.collectionVariables.get('totalResponseTime') || 0;
pm.collectionVariables.set('totalResponseTime', totalTime + responseTime);
`;

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

const usageInstructions = `
// HOW TO USE THESE TEST SCRIPTS:
//
// 1. Copy the relevant test script from above
// 2. Paste it into the "Tests" tab of your Postman request
// 3. Modify the tests as needed for your specific use case
// 4. Run the request to see the test results
//
// RECOMMENDED TEST SCRIPTS BY ENDPOINT TYPE:
//
// Health Checks: healthCheckTests
// Campaign Creation: campaignCreationTests
// Character Creation: characterCreationTests
// Session Creation: sessionCreationTests
// AI Responses: aiResponseTests
// Dice Rolls: diceRollTests
// Skill Checks: skillCheckTests
// Error Responses: errorResponseTests
// Performance Testing: performanceTests
//
// COLLECTION-LEVEL SCRIPTS:
// - Add collectionPreRequest to the collection's Pre-request Script tab
// - Add collectionPostResponse to the collection's Tests tab
//
// UTILITY SCRIPTS:
// - Use generateTestData for creating random test data
// - Use cleanupTests for cleaning up after test runs
`;

// Export all test scripts
module.exports = {
  basicResponseTests,
  healthCheckTests,
  campaignCreationTests,
  characterCreationTests,
  sessionCreationTests,
  aiResponseTests,
  diceRollTests,
  skillCheckTests,
  errorResponseTests,
  performanceTests,
  generateTestData,
  cleanupTests,
  collectionPreRequest,
  collectionPostResponse,
  usageInstructions,
};
