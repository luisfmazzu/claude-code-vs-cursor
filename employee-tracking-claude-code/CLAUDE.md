# Project Setup Instructions

## Technology Stack

- **Frontend Framework**: Next.js with TypeScript
- **Build Tool**: npm
- **Styling**: Tailwind CSS
- **Backend**: Nest.js with TypeScript, Supabase
- **AI**: Grok v3

## Development Setup

### Frontend Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── lib/           # Third-party library configurations
│   └── supabase.ts # Supabase client setup
└── styles/        # Global styles and Tailwind config
```

### Backend Project Structure

```
src/
├── modules/       # Feature modules
├── common/        # Shared utilities and configurations
├── config/        # Configuration files
├── database/      # Database-related files
```

## Development Guidelines

### TypeScript

- Use strict mode for type safety
- Define interfaces for all data models
- Avoid using `any` type

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Keep components small and focused
- Use React.memo for performance optimization when needed

### Tailwind CSS

- Use utility classes for styling
- Create custom components for repeated patterns
- Configure theme in `tailwind.config.js`

### State Management

- Use React Context for simple global state
- Consider React Query for server state
- Consider Zustand for complex state management
- Keep component state local when possible
- Avoid prop drilling by leveraging state management tools

### Test

- Always write unit and integration tests after finishing a task
- Validate if all test passes before moving on to the next task