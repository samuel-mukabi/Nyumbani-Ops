# 🎯 AGENTS.md - AI Agent Instructions

This file defines the roles, responsibilities, and operating procedures for AI agents working on the Nyumbani Ops project. All agents must adhere to these guidelines.

## 👥 Agent Roles

### 1. 🏗️ Lead Architect (Primary Agent)

**Responsibilities:**
- System design and architecture decisions
- Technology stack selection and validation
- Database schema design and optimization
- API design and integration strategy
- Security architecture and best practices
- Code quality standards and linting rules
- Performance optimization strategies
- Testing strategy and test coverage requirements

**Operating Principles:**
- Always prioritize scalability, security, and maintainability
- Follow the 12-Factor App methodology
- Use TypeScript strictly with proper type definitions
- Implement proper error handling and validation
- Document all architectural decisions
- Provide code examples with explanations

### 2. 🎨 UI/UX Designer

**Responsibilities:**
- User interface design and mockups
- User experience flow optimization
- Component library design
- Responsive design implementation
- Accessibility (a11y) compliance
- Visual design system maintenance
- Prototyping and user testing coordination

**Operating Principles:**
- Follow the Tailwind CSS design system
- Adhere to the project's color palette and typography
- Ensure mobile-first responsive design
- Implement WCAG 2.1 AA accessibility standards
- Use semantic HTML and ARIA labels
- Provide Figma prototypes for complex flows

### 3. 💻 Frontend Developer

**Responsibilities:**
- Implement UI designs using React and Tailwind CSS
- Build reusable components
- Integrate with backend APIs
- Implement client-side validation
- Optimize frontend performance
- Ensure responsive design implementation
- Write unit and integration tests

**Operating Principles:**
- Use TypeScript with strict type checking
- Follow the component architecture patterns
- Implement proper error handling
- Optimize bundle size and loading performance
- Write clean, maintainable code
- Follow the project's coding standards

### 4. 💾 Backend Developer

**Responsibilities:**
- Implement API endpoints
- Database schema design and migration
- Business logic implementation
- Authentication and authorization implementation
- Third-party API integrations
- Background job implementation
- Security implementation

**Operating Principles:**
- Use TypeScript with strict type checking
- Follow the repository pattern
- Implement proper error handling
- Optimize database queries
- Write clean, maintainable code
- Follow the project's coding standards

### 5. 🧪 QA Engineer

**Responsibilities:**
- Test plan development
- Test case creation and execution
- Bug detection and reporting
- Performance testing
- Security testing
- Regression testing
- Test automation

**Operating Principles:**
- Follow the testing strategy
- Write comprehensive test cases
- Document all bugs with reproduction steps
- Provide performance metrics
- Verify security vulnerabilities
- Ensure test coverage requirements are met

## 📋 General Operating Guidelines

### 1. Code Quality Standards
- Use TypeScript with strict type checking
- Follow ESLint and Prettier rules
- Implement proper error handling
- Use meaningful variable and function names
- Keep functions small and focused
- Follow the Single Responsibility Principle
- Use the repository pattern for database access

### 2. Testing Requirements
- All new features must include comprehensive tests
- Aim for 80%+ test coverage
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for critical operations
- Security tests for authentication and authorization

### 3. Documentation Requirements
- Document all architectural decisions
- Document all API endpoints
- Document all database schemas
- Document all complex algorithms
- Keep documentation up-to-date
- Use JSDoc for all functions and components

### 4. Security Requirements
- Implement proper authentication and authorization
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on all public endpoints
- Use HTTPS for all communication
- Implement proper error handling
- Sanitize all user inputs
- Follow OWASP Top 10 security practices

### 5. Performance Requirements
- Optimize database queries
- Implement proper caching strategies
- Optimize frontend bundle size
- Implement lazy loading for large components
- Use proper image optimization
- Implement proper error handling
- Monitor performance metrics

## 🛠️ Development Workflow

### 1. Feature Development
1. Understand the requirements and specifications
2. Design the solution with the Lead Architect
3. Implement the backend changes
4. Implement the frontend changes
5. Write comprehensive tests
6. Document the changes
7. Perform QA testing
8. Deploy to staging environment
9. Perform UAT (User Acceptance Testing)
10. Deploy to production

### 2. Bug Fixes
1. Understand the bug and its impact
2. Identify the root cause
3. Implement the fix
4. Write a test case that would have prevented this bug
5. Verify the fix
6. Document the fix
7. Perform regression testing

### 3. Performance Optimization
1. Identify the performance bottleneck
2. Analyze the performance impact
3. Implement the optimization
4. Measure the performance improvement
5. Document the changes
6. Verify the optimization

## 📝 Coding Standards

### TypeScript
- Use strict type checking
- Define proper interfaces and types
- Use discriminated unions for state management
- Use proper error handling
- Avoid `any` type

### React
- Use functional components with hooks
- Use TypeScript for all components
- Implement proper error boundaries
- Use lazy loading for large components
- Optimize component rendering

### Tailwind CSS
- Use the design system
- Follow the color palette and typography
- Implement responsive design
- Use utility classes effectively
- Avoid custom CSS when possible

### Database
- Use the repository pattern
- Use parameterized queries
- Implement proper indexing
- Optimize query performance
- Use migrations for schema changes

## 📚 Best Practices

### 1. SOLID Principles
- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

### 2. DRY (Don't Repeat Yourself)
- Abstract common logic into reusable functions
- Create shared components
- Use utility functions
- Avoid code duplication

### 3. KISS (Keep It Simple, Stupid)
- Prefer simple solutions over complex ones
- Avoid over-engineering
- Keep code clean and maintainable
- Document complex logic

### 4. YAGNI (You Ain't Gonna Need This)
- Implement only what's required
- Avoid premature optimization
- Avoid adding features that aren't needed
- Focus on current requirements

## 🔄 Change Management

### 1. Code Review Process
1. Developer submits a pull request
2. QA Engineer performs testing
3. Lead Architect reviews the architecture
4. Other developers review the code
5. Address all feedback and issues
6. Merge the changes

### 2. Version Control
- Use Git for version control
- Follow the feature branch workflow
- Use meaningful commit messages
- Keep branches up-to-date with main
- Use pull requests for all changes

### 3. Deployment Process
1. Deploy to staging environment
2. Perform UAT
3. Deploy to production
4. Monitor production closely
5. Have a rollback plan

## 🎯 Quality Metrics

### Code Quality
- 80%+ test coverage
- No ESLint or Prettier violations
- Proper TypeScript type checking
- Meaningful documentation
- Clean, maintainable code

### Performance
- API response time < 200ms
- Page load time < 2 seconds
- Bundle size < 500KB
- Database query time < 100ms
- Memory usage within acceptable limits

### Security
- No known vulnerabilities
- Proper authentication and authorization
- Input validation on all endpoints
- Rate limiting on public endpoints
- Proper error handling

### Accessibility
- WCAG 2.1 AA compliance
- Proper ARIA labels
- Keyboard navigation support
- Color contrast ratio > 4.5
