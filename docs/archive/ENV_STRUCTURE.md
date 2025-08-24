# Environment File Structure

## Overview

The AI-Powered D&D Game uses a specific structure for environment files to maintain consistency between development, testing, and production environments.

## File Structure

```
AI-Powered-DnD-Game/
├── .env                    # Active environment file (root directory)
├── config/
│   ├── env.example         # Template for development
│   ├── env.production      # Template for production
│   └── mongo-init.js       # MongoDB initialization
└── docker-compose.yml      # References root .env file
```

## Environment File Locations

### ✅ **Active Environment File**
- **Location**: `.env` (root directory, same level as docker-compose.yml)
- **Purpose**: Contains the actual environment variables used by the application
- **Used by**: Docker Compose, all services
- **Git Status**: Should be in `.gitignore` (not committed to version control)

### ✅ **Template Files**
- **Location**: `config/env.example` and `config/env.production`
- **Purpose**: Templates for creating the active .env file
- **Git Status**: Committed to version control as examples

## Setup Process

### For Development
```bash
# Copy the development template to create active .env file
cp config/env.example .env

# Edit the .env file with your actual values
nano .env
```

### For Production
```bash
# Copy the production template to create active .env file
cp config/env.production .env

# Edit the .env file with your production values
nano .env
```

## Why This Structure?

1. **Docker Compose Compatibility**: Docker Compose expects the .env file to be in the same directory as the docker-compose.yml file by default.

2. **Security**: The active .env file (containing secrets) stays in the root and is gitignored, while templates (with placeholder values) are safely committed.

3. **Consistency**: All documentation and scripts reference this standard structure.

4. **Flexibility**: Different templates can be maintained for different environments.

## Important Notes

- ⚠️ **Never commit the root `.env` file** - it contains sensitive information
- ✅ **Always use templates** from the `config/` directory to create your `.env` file
- 🔄 **Update templates** when adding new environment variables
- 📝 **Document new variables** in both templates and this guide

## Troubleshooting

### Environment Variables Not Loading
1. Verify `.env` file exists in root directory: `ls -la .env`
2. Check file permissions: `chmod 644 .env`
3. Restart services after changes: `docker-compose restart`

### Template Files Missing
1. Verify templates exist: `ls -la config/env.*`
2. If missing, check git status: `git status`
3. Pull latest changes: `git pull origin main`

## Migration from Old Structure

If you previously had `.env` files in the `config/` directory:

```bash
# Move existing config/.env to root (if it exists)
mv config/.env .env

# Update docker-compose.yml references (already done in latest version)
# Update documentation references (already done in latest version)
```

## Environment Variables Reference

See the template files for the complete list of available environment variables:
- Development: `config/env.example`
- Production: `config/env.production`

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Production Deployment](PRODUCTION_DEPLOYMENT.md)
- [User Guide](USER_GUIDE.md)
- [Troubleshooting](TROUBLESHOOTING.md)
