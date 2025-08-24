# 🎲 AI-Powered D&D Game

A modern, AI-enhanced Dungeons & Dragons game application that combines traditional tabletop RPG mechanics with cutting-edge AI technology. Create campaigns, manage characters, run sessions, and let AI assist with storytelling, combat, and world-building.

## ✨ Features

### 🎮 Core Game Features
- **Campaign Management**: Create and manage multiple D&D campaigns with different themes
- **Character Creation**: Build both human and AI-controlled characters with full D&D 5e mechanics
- **Multi-Session Support**: Continue campaigns across multiple gaming sessions
- **AI Dungeon Master**: Intelligent AI assistance for storytelling and game management
- **Combat System**: Full D&D 5e combat mechanics with condition tracking
- **Quest System**: AI-generated quests and dynamic world exploration
- **Skill Checks**: Comprehensive skill check system with D&D 5e rules

### 🤖 AI Integration
- **Smart Model Selection**: Automatically chooses the best AI model (Flash-Lite/Flash/Pro) for each task
- **Context-Aware Responses**: AI remembers session history and maintains consistency
- **Dynamic Storytelling**: AI generates scenarios, NPCs, and story elements
- **Character Development**: AI assists with character growth and personality development
- **World Building**: AI helps create and expand your campaign world

### 🎨 User Interface
- **Modern Web Interface**: Clean, responsive design that works on all devices
- **Real-Time Updates**: Live updates during gameplay sessions
- **Campaign Dashboard**: Comprehensive overview of all your campaigns
- **Session Analytics**: Track session performance and player engagement
- **Quest Management**: Organize and track quests with AI assistance

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-powered-dnd-game.git
   cd ai-powered-dnd-game
   ```

2. **Environment Setup**
   ```bash
# Copy environment template
cp config/env.example .env

# Edit .env file with your configuration
nano .env
   ```

3. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=password
   MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin
   
   # Google Gemini AI Configuration
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
   GEMINI_FLASH_MODEL=gemini-2.5-flash
   GEMINI_PRO_MODEL=gemini-2.5-pro
   
   # Security Configuration
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Docker Configuration
BACKEND_URL=http://backend:5001
   ```

4. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Or build and start
   docker-compose up --build -d
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the game interface.

**Note**: The frontend runs on port 3000 by default. If you encounter port conflicts, the system will automatically try ports 3001, 3002, etc. Make sure your `CORS_ORIGIN` includes all potential ports.

### Alternative: Local Development

If you prefer to run locally without Docker:

1. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Start MongoDB locally**
   ```bash
   # Using Docker for MongoDB only
   docker run -d --name dnd-game-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ai-dnd-game mongo:7.0
   ```

3. **Start the Application**
   ```bash
   # Start backend (in backend directory)
   npm run dev
   
   # Start frontend (in frontend directory)
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the game interface.

## 🎯 Getting Started

### 1. Create Your First Campaign
1. Click "Create New Campaign" on the main dashboard
2. Choose a theme (Fantasy, Sci-Fi, Horror, etc.)
3. Set campaign name and description
4. Configure difficulty and session length preferences

### 2. Create Characters
1. **Human Characters**: Use the character creation wizard
   - Choose race, class, and background
   - Roll or assign ability scores
   - Select skills and equipment
   
2. **AI Characters**: Let AI generate NPCs and companions
   - Specify character role and personality
   - AI creates backstory and motivations
   - Automatic stat generation

### 3. Start a Session
1. Select your campaign from the dashboard
2. Click "Start New Session"
3. Choose active characters for the session
4. Set session parameters (location, weather, time)
5. Begin gameplay with AI assistance

## 🎮 Gameplay Guide

### Running a Session

#### **AI Dungeon Master Commands**
- **Generate Scene**: "Create a tavern scene with 3 NPCs"
- **NPC Interaction**: "Have the innkeeper ask about our quest"
- **Combat Setup**: "Start a combat encounter with 3 goblins"
- **World Building**: "Describe what we see in the forest"

#### **Combat Management**
- **Initiative Tracking**: Automatic initiative rolls and turn management
- **Action Processing**: Handle attacks, spells, and movement
- **Condition Tracking**: Monitor status effects and durations
- **Environmental Effects**: Add terrain and weather impacts

#### **Quest Management**
- **Generate Quests**: AI creates quests based on campaign theme
- **Track Objectives**: Monitor quest progress and completion
- **World Exploration**: Discover new locations and factions
- **Reward System**: Experience, items, and story progression

### Character Development

#### **Leveling Up**
- Automatic experience tracking
- Hit point increases
- New abilities and spells
- Skill improvements

#### **Personality Growth**
- AI tracks character development
- Relationship building with NPCs
- Background story expansion
- Character arc progression

## 🔧 Configuration

### AI Model Selection
The application automatically selects the best AI model for each task:

- **Flash-Lite**: Simple tasks (skill checks, basic responses)
- **Flash**: Moderate complexity (character generation, combat)
- **Pro**: Complex tasks (story generation, world building)

#### **Model Configuration**
Configure AI models in your `.env` file:
```env
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true
```

#### **Performance Tuning**
Adjust response time thresholds and quality settings:
```env
FLASH_LITE_RESPONSE_TIME_THRESHOLD=3000
FLASH_RESPONSE_TIME_THRESHOLD=5000
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000
```

### Campaign Themes
Choose from 15+ pre-built themes:
- **Fantasy**: Traditional D&D settings
- **Sci-Fi**: Space exploration and technology
- **Horror**: Dark and mysterious adventures
- **Steampunk**: Victorian-era technology
- **Post-Apocalyptic**: Surviving in a ruined world

### Difficulty Settings
- **Easy**: New players, story-focused
- **Medium**: Balanced challenge
- **Hard**: Experienced players, tactical combat
- **Deadly**: High-stakes, survival-focused

## 📊 Session Management

### Session Analytics
Track your gaming sessions with detailed metrics:
- Session duration and participant count
- Story events and combat rounds
- Player engagement and difficulty ratings
- AI response times and quality

### Campaign Timeline
- Visual timeline of all sessions
- Story progression tracking
- Character development milestones
- World changes and discoveries

### Session Comparison
- Compare different sessions
- Identify patterns and improvements
- Track campaign evolution
- Generate recommendations

## 🛠️ Troubleshooting

### Common Issues

#### **Docker Services Not Starting**
- Check if Docker and Docker Compose are running
- Verify the `.env` file exists and has correct values
- Check container logs: `docker-compose logs [service-name]`
- Ensure ports 80, 5001, 27017, and 6379 are available

#### **Environment Variable Issues**
- Verify `.env` file is in the root directory (same as docker-compose.yml)
- Check that all required variables are set (especially GEMINI_API_KEY)
- Restart services after changing environment variables: `docker-compose restart`

#### **AI Not Responding**
- Check your Gemini API key in the `.env` file
- Verify internet connection
- Check API usage limits
- Check backend logs: `docker-compose logs backend`

#### **Database Connection Issues**
- Ensure MongoDB container is healthy: `docker-compose ps mongodb`
- Verify connection string in `.env` uses `mongodb:27017` (not localhost)
- Check MongoDB logs: `docker-compose logs mongodb`

#### **Frontend Not Loading**
- Check if frontend container is running: `docker-compose ps frontend`
- Verify nginx configuration and logs
- Check if port 80 is accessible

#### **CORS Issues**
- Ensure `CORS_ORIGIN` in `.env` includes all frontend ports (3000, 3001, 3002)
- Check that no local npm/ts-node processes are running on the same ports
- Use `docker-compose up` instead of `npm run dev` to avoid port conflicts
- Verify backend is accessible: `curl -H "Origin: http://localhost:3000" http://localhost:5001/api/campaigns`
- Check backend logs for CORS-related errors: `docker-compose logs backend | grep -i cors`

#### **Performance Issues**
- Monitor container resource usage: `docker stats`
- Check Redis cache status: `docker-compose logs redis`
- Restart services: `docker-compose restart`

### Getting Help
- Check the logs in `backend/logs/`
- Review the test suite for examples
- Check GitHub issues for known problems

## 🧪 Testing

The application includes a comprehensive test suite:

```bash
# Run all tests
cd backend
npm test

# Run specific test files
npm test -- --testPathPattern="CharacterService.test.ts"

# Run tests with coverage
npm run test:coverage
```

### AI Integration Testing

Test the AI integration directly in the browser:

1. **Start the application**: `docker-compose up -d`
2. **Navigate to test page**: `http://localhost:3000/test-ai`
3. **Try sample actions**:
   - "I look around the tavern"
   - "I approach the bartender"
   - "I roll for perception"

This test page bypasses the main game interface and directly tests the AI story generation API.

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB instance
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment

The application is fully containerized and ready for production deployment:

```bash
# Start all services with Docker Compose
docker-compose up -d

# Build and start (recommended for first run)
docker-compose up --build -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### **Service Architecture**
- **Frontend**: Nginx-based web server on port 80
- **Backend**: Node.js API server on port 5001
- **MongoDB**: Database server on port 27017
- **Redis**: Cache server on port 6379

#### **Environment Configuration**
All services automatically load configuration from the `.env` file in the root directory:
- Database credentials and connection strings
- AI API keys and model selection
- Security settings and CORS configuration
- Performance and logging options

#### **Health Checks**
All services include health checks and automatic restart policies:
- MongoDB: Database connectivity and authentication
- Redis: Cache service availability
- Backend: API endpoint responsiveness
- Frontend: Web server accessibility

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **D&D 5e Rules**: Based on Wizards of the Coast's Dungeons & Dragons
- **Google Gemini**: AI capabilities powered by Google's Gemini models
- **Open Source Community**: Built with amazing open source tools

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and inline code comments
- **Community**: Join our Discord server for help and discussion

---

**Ready to start your AI-powered D&D adventure?** 🎲✨

Create your first campaign, gather your party, and let AI enhance your tabletop gaming experience!
