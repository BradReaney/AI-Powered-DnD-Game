// MongoDB initialization script for AI D&D Game
db = db.getSiblingDB('ai-dnd-game');

// Create collections if they don't exist
db.createCollection('campaigns');
db.createCollection('characters');
db.createCollection('sessions');
db.createCollection('storyevents');

// Create indexes for better performance
db.campaigns.createIndex({ "name": 1 });
db.campaigns.createIndex({ "createdAt": 1 });
db.characters.createIndex({ "campaignId": 1 });
db.characters.createIndex({ "name": 1 });
db.sessions.createIndex({ "campaignId": 1 });
db.sessions.createIndex({ "sessionDate": 1 });

print('AI D&D Game database initialized successfully!');
