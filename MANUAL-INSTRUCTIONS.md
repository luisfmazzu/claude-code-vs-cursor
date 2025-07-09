# Full-Stack Coding Interview AI Instructions

## Overview

This document outlines the comprehensive setup and workflow for conducting full-stack coding interviews using AI-powered development tools. The approach compares two leading AI coding assistants (Claude Code and Cursor) while implementing an employee tracking system as a practical demonstration.

## Tool Setup

### Primary AI Development Tools

#### Version 1: Claude Code
- **Configuration**: Requires custom project rules via modified `CLAUDE.md`

#### Version 2: Cursor
- **Configuration**: Uses Cursor rules system for project-specific guidelines

### Model Control Protocol (MCP) Extensions

#### Essential MCP Tools

##### Context7 - Enhanced Context Management
- **Repository**: https://github.com/upstash/context7
- **Purpose**: Advanced context tracking and memory management
- **Benefits**: 
  - Improves AI understanding of project state
  - Reduces need for repeated explanations
- **Setup**: Requires Upstash account and Redis configuration

##### Shadcn UI - Component Library Integration
- **Repository**: https://mcpservers.org/servers/heilgar/shadcn-ui-mcp-server
- **Purpose**: Streamlined UI component generation and management
- **Benefits**:
  - Consistent design system implementation
  - Rapid prototyping of user interfaces
  - Pre-built, accessible components
- **Best Practices**: Use for frontend components in React/Next.js projects

##### Supabase - Database and Backend Services
- **Documentation**: https://supabase.com/docs/guides/getting-started/mcp?queryGroups=os&os=linux#claude-code
- **Purpose**: Integrated backend-as-a-service functionality
- **Features**:
  - PostgreSQL database management
  - Real-time subscriptions
  - Authentication and authorization
  - Edge functions and storage
- **Integration**: Direct API calls and schema management

#### Advanced MCP Tools (Future Implementation)

##### GitHub MCP - PR Automation
- **Repository**: https://github.com/github/github-mcp-server
- **Purpose**: Automated pull request creation and management
- **Capabilities**:
  - Automated code reviews
  - Issue tracking integration
  - Branch management
  - Commit message optimization

##### TaskMaster - Project Management
- **Website**: https://www.task-master.dev/
- **Purpose**: AI-powered task breakdown and project management
- **Features**:
  - Automatic task generation from requirements
  - Dependency tracking
  - Progress monitoring
  - Resource allocation suggestions

##### Playwright - End-to-End Testing
- **Repository**: https://github.com/microsoft/playwright-mcp
- **Purpose**: Automated browser testing integration
- **Benefits**:
  - Cross-browser compatibility testing
  - User journey validation
  - Performance monitoring
  - Visual regression testing

##### Mem0 - Long-term Memory Management
- **Repository**: https://github.com/mem0ai/mem0-mcp
- **Purpose**: Persistent AI memory across projects
- **Requirements**: Local server setup
- **Ideal For**: Long-term project maintenance and knowledge retention
- **Setup Complexity**: High - requires dedicated infrastructure

##### Vercel - Deployment Management
- **Repository**: https://github.com/nganiet/mcp-vercel
- **Purpose**: Streamlined deployment and hosting automation
- **Features**:
  - Automatic deployments from Git
  - Preview environments
  - Performance monitoring
  - Edge network optimization

## Development Workflow

### Phase 1: Planning
1. Switch to planning mode
2. Change model to Claude Opus: `/model opus`
3. Send prompt from `PROMPT.md`
4. When plan is ready, select "2" to "keep planning" (do not implement yet)

### Phase 2: Implementation
1. Change model to Claude Sonnet: `/model sonnet`
2. List all tasks and sub-tasks
3. Begin task execution cycle

### Development Cycle
Each iteration should include:
- **Implement** the next task
- **Test** functionality when possible
- **Review** code thoroughly

## Technical Challenges Encountered
- A few bugs were encontered while testing and solving those via prompts seemed to be leading nowhere. Manual review and fixing took less than 10 minutes.


### 3. Scalability Concerns
- **Limitation**: Current AI models cannot handle scalability review without human oversight
- **Recommendation**: Full human review required for production-ready scalability