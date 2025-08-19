# Contributing to B.Tech Question Bank

First off, thank you for considering contributing to B.Tech Question Bank! 🎉

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Mention your environment (OS, Node version, etc.)

### 💡 Suggesting Features
- Open a GitHub issue with the "enhancement" label
- Provide clear description and use cases
- Consider if it fits the project's scope

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Make your changes
- Add tests if applicable
- Submit a pull request

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/B.Tech-Question-Bank.git
   cd B.Tech-Question-Bank
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Environment Setup**
   - Copy `server/config.env.example` to `server/config.env`
   - Fill in your database and API credentials

4. **Run Development Server**
   ```bash
   npm run dev-all
   ```

## Pull Request Process

1. **Branch Naming**
   - `feature/description` for new features
   - `bugfix/description` for bug fixes
   - `docs/description` for documentation

2. **Before Submitting**
   - Test your changes thoroughly
   - Update documentation if needed
   - Ensure no console errors/warnings

3. **PR Description**
   - Clear title describing the change
   - Link to related issues
   - Screenshots for UI changes

## Coding Standards

### JavaScript/React
- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable names
- Add comments for complex logic

### File Structure
- Keep components small and focused
- Use proper file naming conventions
- Organize imports logically

### API Development
- Follow RESTful conventions
- Include proper error handling
- Add input validation
- Document new endpoints

## Commit Message Guidelines

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add password reset functionality
fix(upload): resolve file size validation issue
docs(readme): update installation instructions
```

## Questions?

Feel free to open an issue for any questions about contributing!
