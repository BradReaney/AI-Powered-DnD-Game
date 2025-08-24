# 🎮 AI-Powered D&D Game - User Guide

## **📋 Table of Contents**

1. [Getting Started](#getting-started)
2. [Game Overview](#game-overview)
3. [Character Creation](#character-creation)
4. [Campaign Management](#campaign-management)
5. [Gameplay](#gameplay)
6. [Combat System](#combat-system)
7. [AI Dungeon Master](#ai-dungeon-master)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## **🚀 Getting Started**

### **Prerequisites**
- **Backend**: Node.js 18+ and MongoDB
- **Frontend**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **AI Integration**: Google Gemini API key

### **Installation**

#### **Backend Setup**
```bash
cd backend
npm install
cp config/env.example .env
# Edit .env with your configuration
npm run dev
```

#### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

#### **Environment Configuration**
```env
# Backend (.env)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-dnd-game
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development

# Frontend (vite.config.ts)
VITE_API_BASE_URL=http://localhost:3000
```

### **First Launch**
1. Start the backend server
2. Start the frontend development server
3. Open your browser to `http://localhost:5173`
4. Create your first campaign or join an existing one

## **🎯 Game Overview**

### **What is AI-Powered D&D Game?**
This is a web-based, AI-driven tabletop role-playing game that uses Google Gemini AI as the Dungeon Master. Players can create characters, join campaigns, and experience dynamic storytelling with persistent state across multiple sessions.

### **Key Features**
- **AI Dungeon Master**: Gemini AI generates dynamic storylines and manages game flow
- **Multi-Session Campaigns**: Persistent story state across multiple play sessions
- **Mixed Character Parties**: Human and AI characters playing together
- **D&D 5e Mechanics**: Authentic skill checks, combat, and character progression
- **Web Interface**: Modern React-based UI for seamless gameplay
- **Campaign Themes**: Multiple campaign styles and scenarios

### **Game Modes**
- **Single Player**: Play with AI characters and AI DM
- **Multiplayer**: Play with other human players and AI DM
- **Mixed**: Combine human and AI players in the same campaign

## **👤 Character Creation**

### **Character Types**

#### **Human Characters**
- **Classes**: Fighter, Wizard, Rogue, Cleric, Ranger, Paladin, Barbarian, Druid, Monk, Sorcerer, Warlock, Artificer
- **Races**: Human, Elf, Dwarf, Halfling, Dragonborn, Tiefling, Half-Elf, Half-Orc, Gnome
- **Backgrounds**: Acolyte, Criminal, Folk Hero, Noble, Sage, Soldier, and more

#### **AI Characters**
- **Automated Generation**: AI creates character backstory, personality, and motivations
- **Dynamic Behavior**: Characters respond to story events and player interactions
- **Consistent Personality**: Maintains character traits across sessions

### **Character Creation Process**

#### **Step 1: Basic Information**
- Choose character type (Human or AI)
- Select race and class
- Determine ability scores
- Choose background

#### **Step 2: Customization**
- Select starting equipment
- Choose spells (for spellcasters)
- Customize appearance and personality
- Write character backstory

#### **Step 3: Campaign Integration**
- Assign character to campaign
- Set starting location
- Establish relationships with other characters

### **Character Progression**
- **Experience Points**: Gain XP through combat, exploration, and roleplay
- **Leveling Up**: Increase abilities, gain new features, and learn spells
- **Equipment**: Find, purchase, and upgrade gear
- **Relationships**: Develop bonds with NPCs and other characters

## **🏰 Campaign Management**

### **Campaign Types**

#### **Adventure Campaigns**
- **Linear Stories**: Follow a predetermined plot with branching choices
- **Sandbox Worlds**: Open exploration with multiple quest lines
- **Mystery Campaigns**: Solve puzzles and uncover secrets
- **Political Intrigue**: Navigate complex social dynamics

#### **Campaign Themes**
- **High Fantasy**: Epic quests in magical realms
- **Dark Fantasy**: Grim adventures in dangerous worlds
- **Urban Fantasy**: Modern settings with magical elements
- **Historical Fantasy**: Fantasy elements in historical periods

### **Campaign Creation**

#### **Step 1: Campaign Setup**
- Choose campaign type and theme
- Set difficulty level
- Define world parameters
- Establish starting conditions

#### **Step 2: World Building**
- Create locations and landmarks
- Design NPCs and factions
- Establish history and lore
- Set up quest hooks and storylines

#### **Step 3: Session Planning**
- Schedule regular play sessions
- Prepare session outlines
- Set session goals and objectives
- Plan for player choices and consequences

### **Session Management**
- **Session Tracking**: Record session events and outcomes
- **Story Continuity**: Maintain narrative consistency across sessions
- **Player Progress**: Track character development and achievements
- **World Evolution**: Update world state based on player actions

## **🎲 Gameplay**

### **Core Gameplay Loop**

#### **1. Session Start**
- Review previous session summary
- Set current scene and situation
- Establish player goals and objectives

#### **2. Story Progression**
- AI DM describes current situation
- Players describe their actions
- AI generates responses and consequences
- Story evolves based on player choices

#### **3. Skill Checks and Combat**
- Resolve skill checks for challenging actions
- Engage in tactical combat encounters
- Track character resources and conditions
- Award experience and rewards

#### **4. Session Conclusion**
- Summarize session events
- Update character progress
- Plan next session hooks
- Save game state

### **Player Actions**

#### **Exploration**
- **Movement**: Navigate through the world
- **Investigation**: Search for clues and information
- **Interaction**: Talk to NPCs and examine objects
- **Discovery**: Uncover new locations and secrets

#### **Social Interaction**
- **Dialogue**: Engage in conversations with NPCs
- **Persuasion**: Convince others through diplomacy
- **Intimidation**: Use threats and force of personality
- **Deception**: Lie and mislead when necessary

#### **Problem Solving**
- **Puzzles**: Solve riddles and mechanical challenges
- **Traps**: Avoid or disarm dangerous mechanisms
- **Environmental Hazards**: Navigate dangerous terrain
- **Resource Management**: Use limited resources wisely

### **AI Dungeon Master Features**
- **Dynamic Storytelling**: Adapts story based on player choices
- **Character Voices**: Gives unique personalities to NPCs
- **World Consistency**: Maintains logical world rules
- **Emotional Engagement**: Creates compelling narrative moments

## **⚔️ Combat System**

### **Combat Overview**
The game uses authentic D&D 5e combat mechanics with AI-driven enemy behavior and dynamic encounter generation.

### **Combat Phases**

#### **1. Initiative**
- Roll initiative for all participants
- Determine turn order
- Set up combat grid and positioning

#### **2. Combat Rounds**
- **Movement**: Move characters on the battlefield
- **Action**: Perform primary actions (attack, cast spell, etc.)
- **Bonus Action**: Use special abilities or quick actions
- **Reaction**: Respond to enemy actions when appropriate

#### **3. Combat Actions**
- **Attack**: Make weapon or spell attacks
- **Cast Spell**: Use magical abilities
- **Dash**: Move at double speed
- **Dodge**: Gain advantage on defense
- **Help**: Assist allies with actions
- **Hide**: Attempt to become hidden
- **Ready**: Prepare action for specific trigger
- **Search**: Look for hidden enemies or objects
- **Use Object**: Interact with environment

### **Combat Mechanics**
- **Attack Rolls**: Roll d20 + modifiers vs. target's Armor Class
- **Damage**: Roll weapon/spell damage dice + modifiers
- **Critical Hits**: Natural 20s deal extra damage
- **Advantage/Disadvantage**: Roll 2d20, take best/worst result
- **Conditions**: Apply status effects like poisoned, stunned, etc.

### **Tactical Elements**
- **Positioning**: Use terrain and cover for tactical advantage
- **Flanking**: Gain advantage when attacking from opposite sides
- **Height Advantage**: Elevated positions provide combat benefits
- **Environmental Hazards**: Use terrain features strategically

## **🤖 AI Dungeon Master**

### **AI Capabilities**

#### **Story Generation**
- **Dynamic Plotlines**: Creates branching story paths
- **Character Development**: Develops NPCs with depth and personality
- **World Building**: Expands the game world based on player exploration
- **Quest Generation**: Creates engaging missions and objectives

#### **Game Management**
- **Rule Adjudication**: Applies D&D 5e rules consistently
- **Balance Management**: Adjusts difficulty based on player skill
- **Pacing Control**: Maintains appropriate story tempo
- **Conflict Resolution**: Handles player disputes and rule questions

#### **Player Interaction**
- **Responsive Dialogue**: Engages in natural conversations
- **Emotional Intelligence**: Recognizes and responds to player emotions
- **Adaptive Difficulty**: Adjusts challenges to player preferences
- **Creative Problem Solving**: Offers multiple solutions to challenges

### **AI Model Selection**
The system automatically selects the best AI model for different tasks:

- **Flash Model**: Fast responses for simple tasks (skill checks, basic dialogue)
- **Pro Model**: High-quality responses for complex tasks (story generation, character development)
- **Dynamic Selection**: Automatically chooses based on task complexity and context

### **AI Context Management**
- **Session Memory**: Remembers important events and decisions
- **Character Consistency**: Maintains NPC personalities across sessions
- **World State Tracking**: Updates world based on player actions
- **Story Continuity**: Ensures narrative consistency

## **🔧 Troubleshooting**

### **Common Issues**

#### **Connection Problems**
- **Backend Not Starting**: Check Node.js version and MongoDB connection
- **Frontend Not Loading**: Verify API base URL and backend status
- **Database Errors**: Ensure MongoDB is running and accessible

#### **AI Response Issues**
- **Slow Responses**: Check internet connection and API key validity
- **Poor Quality**: Verify API key has access to appropriate models
- **Context Loss**: Check if session data is being properly saved

#### **Game Performance**
- **Slow Loading**: Check database performance and query optimization
- **Memory Issues**: Monitor server resource usage
- **Response Delays**: Optimize AI API calls and caching

### **Performance Optimization**

#### **Backend Optimization**
- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Query Optimization**: Use efficient database queries
- **Caching**: Implement Redis or in-memory caching for frequently accessed data
- **Connection Pooling**: Optimize database connection management

#### **Frontend Optimization**
- **Component Lazy Loading**: Load components only when needed
- **State Management**: Efficient state updates and re-renders
- **API Caching**: Cache API responses to reduce server calls
- **Bundle Optimization**: Minimize JavaScript bundle size

### **Debugging Tools**
- **Logging**: Comprehensive logging for backend operations
- **Error Tracking**: Detailed error messages and stack traces
- **Performance Monitoring**: Track response times and resource usage
- **Development Tools**: Browser dev tools and React DevTools

## **📚 API Reference**

### **Authentication**
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/me
```

### **Campaigns**
```http
GET /api/campaigns
POST /api/campaigns
GET /api/campaigns/:id
PUT /api/campaigns/:id
DELETE /api/campaigns/:id
```

### **Characters**
```http
GET /api/characters
POST /api/characters
GET /api/characters/:id
PUT /api/characters/:id
DELETE /api/characters/:id
```

### **Sessions**
```http
GET /api/sessions
POST /api/sessions
GET /api/sessions/:id
PUT /api/sessions/:id
DELETE /api/sessions/:id
```

### **Combat**
```http
POST /api/combat/encounters
GET /api/combat/encounters/:id
PUT /api/combat/encounters/:id
POST /api/combat/actions
```

### **AI Integration**
```http
POST /api/ai/generate
POST /api/ai/chat
POST /api/ai/context
GET /api/ai/models
```

## **📖 Additional Resources**

### **Documentation**
- [Installation Guide](INSTALLATION.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Technical Architecture](../plans/TECHNICAL-ARCHITECTURE.md)

### **Support**
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join the community for help and discussion
- **Documentation**: Comprehensive guides and tutorials
- **Examples**: Sample campaigns and character builds

### **Contributing**
- **Code Contributions**: Submit pull requests and improvements
- **Bug Reports**: Help identify and fix issues
- **Feature Requests**: Suggest new game features
- **Documentation**: Improve guides and tutorials

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active Development

For the latest updates and support, visit our [GitHub repository](https://github.com/your-username/ai-powered-dnd-game).
