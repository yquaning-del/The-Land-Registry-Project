# Blockchain Land Registry Platform - Vibe Coding Standards

## Project Overview
This is a Human-in-the-Loop AI-powered land registry system for the African market (Ghana/Nigeria). The platform verifies physical land documents against satellite data before minting blockchain records.

## Core Principles

### 1. TypeScript First
- **All code must be written in TypeScript** with strict type checking enabled
- No `any` types unless absolutely necessary (document why)
- Use proper type definitions for all functions, components, and data structures
- Leverage TypeScript's advanced features: generics, utility types, and discriminated unions

### 2. Modular Agentic Logic
- **Break down AI/verification logic into discrete, composable agents**
- Each agent should have a single, well-defined responsibility
- Agents should be chainable and composable
- Use dependency injection for agent configuration
- Example structure:
  ```typescript
  interface Agent<TInput, TOutput> {
    execute(input: TInput): Promise<AgentResult<TOutput>>;
    confidenceScore: number;
  }
  ```

### 3. Confidence Score Requirement
- **Every AI-generated function MUST include a `confidenceScore` parameter**
- Confidence scores range from 0.0 to 1.0
- Document the methodology for calculating confidence scores
- Functions should return results with confidence metadata:
  ```typescript
  interface AIResult<T> {
    data: T;
    confidenceScore: number;
    reasoning?: string;
    metadata?: Record<string, unknown>;
  }
  ```

### 4. Human-in-the-Loop Design
- Always provide clear escalation paths for low-confidence results
- Include audit trails for all AI decisions
- Design UIs that make human review intuitive and efficient
- Store human feedback for model improvement

## Architecture Standards

### File Organization
```
/app                  # Next.js App Router pages
/components           # React components (UI + feature)
  /ui                 # Reusable UI primitives
  /features           # Feature-specific components
/lib                  # Business logic and utilities
  /ai                 # AI agents and verification logic
  /supabase           # Database clients and queries
  /utils              # Helper functions
/types                # TypeScript type definitions
/supabase/migrations  # Database migration files
```

### Component Standards
- Use functional components with TypeScript
- Implement proper error boundaries
- Use React Server Components by default (mark with 'use client' only when needed)
- Follow the composition pattern over inheritance
- Keep components under 200 lines (split if larger)

### State Management
- Use React Server Components for data fetching
- Client state: React hooks (useState, useReducer)
- Server state: Supabase real-time subscriptions
- Form state: Controlled components with validation

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming (defined in globals.css)
- Component variants should use `clsx` or `tailwind-merge`

## AI/ML Standards

### Verification Pipeline
1. **Document Analysis Agent** - Extract text and metadata (confidence required)
2. **GPS Validation Agent** - Verify coordinates against satellite data (confidence required)
3. **Cross-Reference Agent** - Check against existing claims (confidence required)
4. **Final Scoring Agent** - Aggregate confidence scores (confidence required)

### Confidence Thresholds
- **High Confidence (≥0.85)**: Auto-approve with human notification
- **Medium Confidence (0.60-0.84)**: Queue for human review
- **Low Confidence (<0.60)**: Require human approval before proceeding

### Error Handling
- All AI operations must have timeout limits
- Implement retry logic with exponential backoff
- Log all AI decisions with timestamps and input data
- Gracefully degrade when AI services are unavailable

## Database Standards

### Supabase Schema
- Use Row Level Security (RLS) for all tables
- Include `created_at` and `updated_at` timestamps
- Use UUIDs for primary keys
- Implement soft deletes where appropriate
- Add indexes for frequently queried columns

### Naming Conventions
- Tables: `snake_case` (e.g., `land_claims`)
- Columns: `snake_case` (e.g., `ai_verification_status`)
- Enums: `UPPER_SNAKE_CASE` (e.g., `PENDING_REVIEW`)
- Functions: `camelCase` in TypeScript, `snake_case` in SQL

## Security Standards

### Authentication
- Use Supabase Auth for user management
- Implement role-based access control (RBAC)
- Roles: `claimant`, `verifier`, `admin`, `super_admin`
- Store sensitive data encrypted at rest

### Data Privacy
- Comply with African data protection regulations
- Implement data retention policies
- Allow users to export/delete their data
- Anonymize data for analytics

## Testing Standards

### Unit Tests
- Test all AI agents independently
- Mock external API calls
- Aim for >80% code coverage on business logic

### Integration Tests
- Test the full verification pipeline
- Test Supabase interactions
- Test authentication flows

### E2E Tests
- Test critical user journeys
- Test the claim submission and approval flow

## Documentation Standards

### Code Comments
- Document all AI confidence score calculations
- Explain complex business logic
- Add JSDoc comments for public APIs
- Include examples for reusable utilities

### README Requirements
- Setup instructions
- Environment variable documentation
- Architecture overview
- Deployment guide

## Git Workflow

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Reference issue numbers when applicable
- Keep commits atomic and focused

### Branch Strategy
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - new features
- `fix/*` - bug fixes
- `hotfix/*` - urgent production fixes

## Performance Standards

### Optimization
- Lazy load components and routes
- Optimize images (use Next.js Image component)
- Implement pagination for large datasets
- Cache AI results when appropriate
- Use Supabase edge functions for heavy computations

### Monitoring
- Log all AI verification attempts
- Track confidence score distributions
- Monitor API response times
- Set up alerts for failed verifications

## Accessibility Standards

- Follow WCAG 2.1 Level AA guidelines
- Ensure keyboard navigation works
- Provide proper ARIA labels
- Test with screen readers
- Support multiple languages (English, Twi, Yoruba, Igbo)

## African Market Considerations

### Localization
- Support local languages
- Handle local date/time formats
- Support local currency formats (GHS, NGN)
- Consider low-bandwidth scenarios

### Cultural Sensitivity
- Respect traditional land ownership structures
- Support communal land claims
- Handle tribal/family land disputes appropriately
- Provide offline-first capabilities where possible

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Maintained By**: Solutions Architecture Team
