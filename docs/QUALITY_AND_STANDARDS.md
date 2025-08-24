# Quality Tools and Coding Standards

## Overview

This document outlines the quality tools, coding standards, and development practices for the AI-Powered D&D Game project. These tools ensure code consistency, maintainability, and high quality across the entire codebase.

## 🛠️ Quality Tools

### 1. Prettier - Code Formatting

**Purpose**: Automatically formats code to maintain consistent style across the project.

**Configuration**: 
- Frontend: `.prettierrc` (80 char width, single quotes, semicolons)
- Backend: `.prettierrc` (100 char width, single quotes, semicolons)

**Usage**:
```bash
# Format all code
npm run format

# Check formatting without changing files
npm run format:check

# Format specific files
npx prettier --write src/components/MyComponent.tsx
```

**Rules**:
- Semi-colons required
- Single quotes for strings
- Trailing commas in objects/arrays
- 2-space indentation
- 80/100 character line width

### 2. ESLint - Code Linting

**Purpose**: Identifies and fixes code quality issues, enforces coding standards.

**Configuration**:
- Frontend: `.eslintrc.js` (React + TypeScript rules)
- Backend: `.eslintrc.js` (Node.js + TypeScript rules)

**Usage**:
```bash
# Lint all code
npm run lint

# Lint and fix automatically fixable issues
npm run lint:fix

# Lint specific files
npx eslint src/components/MyComponent.tsx
```

**Key Rules**:
- No unused variables (except those starting with `_`)
- Prefer `const` over `let`
- No `var` usage
- No `console.log` in production code
- TypeScript strict mode compliance

### 3. TypeScript - Type Safety

**Purpose**: Provides static type checking and enhanced IDE support.

**Configuration**:
- Frontend: `tsconfig.json` (React + Vite)
- Backend: `tsconfig.json` (Node.js + Jest)

**Usage**:
```bash
# Check TypeScript compilation
npm run build

# Type checking only
npx tsc --noEmit
```

**Standards**:
- Strict mode enabled
- No implicit `any` types
- Proper interface definitions
- Generic type usage where appropriate

### 4. Husky - Git Hooks

**Purpose**: Automatically runs quality checks before commits.

**Configuration**: `.husky/pre-commit` hooks in both frontend and backend.

**What it does**:
- Runs ESLint on staged files
- Runs Prettier on staged files
- Prevents commits with quality issues

**Setup**:
```bash
# Install husky (already done)
npm install

# Hooks are automatically installed via prepare script
```

### 5. lint-staged - Staged File Processing

**Purpose**: Runs quality tools only on files that are staged for commit.

**Configuration**: `.lintstagedrc.js` in both packages.

**Benefits**:
- Faster than running on entire codebase
- Only processes changed files
- Integrates with Husky for pre-commit hooks

## 📋 Available Commands

### Root Level Commands
```bash
# Quality checks across all packages
npm run quality          # Check quality
npm run quality:fix      # Check and fix quality issues

# Linting across all packages
npm run lint             # Lint all code
npm run lint:fix         # Lint and fix issues

# Formatting across all packages
npm run format           # Format all code
npm run format:check     # Check formatting

# Development
npm run dev              # Start both frontend and backend
npm run build            # Build both packages
npm run test             # Run tests in both packages
```

### Individual Package Commands
```bash
# Frontend
npm run quality:frontend
npm run lint:frontend
npm run format:frontend

# Backend
npm run quality:backend
npm run lint:backend
npm run format:backend
```

### Quality Check Script
```bash
# Comprehensive quality check
./scripts/quality-check.sh
```

## 🎯 Coding Standards

### General Principles
1. **Consistency**: Follow established patterns in the codebase
2. **Readability**: Write code that's easy to understand and maintain
3. **Performance**: Consider performance implications of code decisions
4. **Security**: Follow security best practices
5. **Testing**: Write tests for new functionality

### TypeScript Standards
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User | null> => {
  // Implementation
};

// ❌ Avoid
const getUser = async (id: any) => {
  // Implementation
};
```

### React Standards
```typescript
// ✅ Good
const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// ❌ Avoid
const MyComponent = (props) => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  );
};
```

### Node.js/Express Standards
```typescript
// ✅ Good
interface CreateUserRequest {
  name: string;
  email: string;
}

const createUser = async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await UserService.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// ❌ Avoid
const createUser = async (req, res) => {
  const user = await UserService.create(req.body);
  res.json(user);
};
```

## 🔄 Development Workflow

### 1. Before Starting Work
```bash
# Ensure quality tools are working
npm run quality

# Fix any existing issues
npm run quality:fix
```

### 2. During Development
- Write code following established patterns
- Use TypeScript types consistently
- Follow ESLint rules
- Format code as you go

### 3. Before Committing
```bash
# Quality checks run automatically via Husky
git add .
git commit -m "feat: add new feature"

# If you want to run manually
npm run quality:fix
```

### 4. Commit Message Standards
Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
feat: add new user authentication system
fix: resolve session timeout issue
docs: update API documentation
style: format code according to standards
refactor: simplify user validation logic
test: add tests for user service
chore: update dependencies
```

## 🚨 Common Issues and Solutions

### Prettier Issues
```bash
# If Prettier conflicts with ESLint
npm run format:fix
npm run lint:fix
```

### TypeScript Errors
```bash
# Check for type errors
npx tsc --noEmit

# Build to see all errors
npm run build
```

### ESLint Errors
```bash
# See all linting errors
npm run lint

# Fix automatically fixable issues
npm run lint:fix
```

### Git Hook Failures
```bash
# If pre-commit hook fails
npm run quality:fix
git add .
git commit -m "your message"
```

## 📊 Quality Metrics

### Targets
- **ESLint**: 0 errors, <5 warnings
- **Prettier**: 100% formatted code
- **TypeScript**: 0 compilation errors
- **Test Coverage**: >80% (when tests are added)

### Monitoring
- Quality checks run on every commit
- CI/CD pipeline includes quality checks
- Regular quality audits via `./scripts/quality-check.sh`

## 🔧 IDE Configuration

### VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- EditorConfig for VS Code

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### WebStorm/IntelliJ
- Enable ESLint integration
- Enable Prettier integration
- Configure TypeScript settings

## 📚 Additional Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)

## 🤝 Contributing

When contributing to the project:

1. Follow the established coding standards
2. Run quality checks before submitting PRs
3. Ensure all tests pass
4. Use conventional commit messages
5. Keep code clean and well-documented

## 📞 Support

If you encounter issues with quality tools:

1. Check this documentation
2. Run `./scripts/quality-check.sh` for diagnostics
3. Check package.json scripts for available commands
4. Review tool-specific documentation
5. Ask the development team for help

---

**Last Updated**: December 2024
**Maintained By**: Development Team
**Review Cycle**: Monthly
