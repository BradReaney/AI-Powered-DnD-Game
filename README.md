# 🎲 AI-Powered D&D Game

A modern, full-stack Dungeons & Dragons game application that combines traditional tabletop RPG mechanics with cutting-edge AI technology. Built with Next.js 15, Express.js, MongoDB, and Google Gemini AI models.

## ✨ Features

### 🎮 Core Game Features
- **Campaign Management**: Create and manage multiple D&D campaigns with different themes
- **Character Creation**: Build both human and AI-controlled characters with full D&D 5e mechanics
- **Multi-Session Support**: Continue campaigns across multiple gaming sessions
- **AI Dungeon Master**: Intelligent AI assistance for storytelling and game management
- **Combat System**: Full D&D 5e combat mechanics with condition tracking
- **Quest System**: AI-generated quests and dynamic world exploration
- **Skill Checks**: Comprehensive skill check system with D&D 5e rules
- **Location Management**: Create and explore detailed campaign worlds

### 🤖 AI Integration
- **Smart Model Selection**: Automatically chooses the best AI model (Flash-Lite/Flash/Pro) for each task
- **Context-Aware Responses**: AI remembers session history and maintains consistency
- **Dynamic Storytelling**: AI generates scenarios, NPCs, and story elements
- **Character Development**: AI assists with character growth and personality development
- **World Building**: AI helps create and expand your campaign world

### 🎨 User Interface
- **Modern Web Interface**: Clean, responsive design built with Next.js 15 and Tailwind CSS
- **Mobile-First Design**: Optimized for mobile devices, especially iPhone 14 Pro Max
- **Real-Time Updates**: Live updates during gameplay sessions
- **Campaign Dashboard**: Comprehensive overview of all your campaigns
- **Session Analytics**: Track session performance and player engagement
- **Quest Management**: Organize and track quests with AI assistance

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS 4
- **Backend**: Express.js, TypeScript, Node.js 18+
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Cache**: Redis 7.2
- **AI**: Google Gemini 2.5 (Flash-Lite, Flash, Pro)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Playwright

### Project Structure
```
AI-Powered-DnD-Game/
├── frontend/          # Next.js 15 React application
├── backend/           # Express.js API server
├── docs/             # Project documentation
├── config/           # Configuration files
├── scripts/          # Build and deployment scripts
└── docker-compose.yml # Docker services configuration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Google Gemini API key
- Node.js 18+ and npm 8+

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
   # Install all dependencies (root, frontend, and backend)
   npm run install:all
   ```

2. **Start MongoDB locally**
   ```bash
   # Using Docker for MongoDB only
   docker run -d --name dnd-game-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ai-dnd-game mongo:7.0
   ```

3. **Start the Application**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on port 3000
   npm run dev:backend   # Backend on port 5001
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

## 🧪 Testing

The application includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:backend
npm run test:frontend

# Run tests with coverage
cd backend && npm run test:coverage
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
- **Frontend**: Next.js application on port 3000
- **Backend**: Express.js API server on port 5001
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

## 🛠️ Development

### Available Scripts

#### **Root Level Scripts**
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both frontend and backend
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format all code
npm run quality          # Run quality checks
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

#### **Frontend Scripts**
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm run format           # Format code
```

#### **Backend Scripts**
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Lint code
npm run format           # Format code
```

### Code Quality

The project uses several tools to maintain code quality:

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation
- **TypeScript**: Static type checking

### Testing Strategy

- **Unit Tests**: Jest for backend services and utilities
- **Integration Tests**: API endpoint testing with supertest
- **E2E Tests**: Playwright for frontend user journey testing
- **Performance Tests**: Load testing and optimization validation

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Ensure mobile-first responsive design
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **D&D 5e Rules**: Based on Wizards of the Coast's Dungeons & Dragons
- **Google Gemini**: AI capabilities powered by Google's Gemini models
- **Open Source Community**: Built with amazing open source tools
- **Next.js Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and the docs directory
- **Community**: Join our Discord server for help and discussion

---

**Ready to start your AI-powered D&D adventure?** 🎲✨

Create your first campaign, gather your party, and let AI enhance your tabletop gaming experience!
