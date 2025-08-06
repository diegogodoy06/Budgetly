# Budgetly - AI Coding Agent Instructions

## Project Overview
**Budgetly** is a multi-tenant financial management system with Django REST backend and React TypeScript frontend. Core concept: **Workspaces** separate financial data by context (Personal, Business, etc.) with member management and role-based permissions.

## Run the Project
Whenever you need to run the project, consider that it is already running on an external terminal
Without the need to start again.
Backend at `http://localhost:8000` and frontend at `http://localhost:3000`.

## Critical Architecture Patterns

### 1. Three-Layer Context System (Frontend)
All data flows through React Context providers in this order:
```tsx
// App.tsx structure - DO NOT change this order
<AuthProvider>           // 1. Authentication state
  <WorkspaceProvider>    // 2. Workspace data + automatic loading
    <ConfiguracoesProvider>  // 3. App settings
```

**Key Integration:** `WorkspaceContext` automatically loads user's workspaces when `AuthContext` provides `user + token`. Never manually trigger workspace loading in components.

### 2. Route Protection Pattern
```tsx
// Routes without workspace requirement
<Route path="/workspaces" element={
  <ProtectedRouteComponent>    // Auth only
    <Layout><WorkspacesPage /></Layout>
  </ProtectedRouteComponent>
} />

// Routes requiring workspace context
<Route path="/dashboard" element={
  <ProtectedRouteComponent>
    <WorkspaceGuard>           // Auth + workspace required
      <Layout><Dashboard /></Layout>
    </WorkspaceGuard>
  </ProtectedRouteComponent>
} />
```

**Critical:** Only `/workspaces` route allows access without workspace selection. All financial data pages require `WorkspaceGuard`.

### 3. Authentication Flow
- Uses Django Token auth (`Token <token>` header format)
- `AuthContext` validates tokens on app init via `/api/auth/profile/`
- API interceptor handles 401s by clearing auth and redirecting
- Login page has demo credentials: `admin@budgetly.com / admin123`

### 4. Workspace Data Isolation
Backend automatically filters all data by current workspace via middleware. Frontend must:
- Send workspace context in API calls where needed
- Use `currentWorkspace` from `WorkspaceContext` for UI state
- Handle workspace switching (clears/reloads dependent data)

## Development Workflows

### Environment Setup
```bash
# Start full stack (requires Docker Desktop running)
docker-compose up --build

# Access points
Frontend: http://localhost:3000
Backend: http://localhost:8000  
Database: PostgreSQL
```

### API Integration Pattern
```typescript
// services/api.ts - Token injection is automatic
const api = axios.create({
  baseURL: 'http://localhost:8000',
  // Token header added by interceptor
});

// Error handling built-in
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto logout + redirect
    }
  }
);
```

### Workspace Creation Flow
1. User creates workspace via `CreateWorkspaceModal`
2. New workspace auto-becomes `currentWorkspace`
3. `WorkspaceGuard` allows navigation to financial pages
4. All subsequent API calls scoped to that workspace

## Key Files & Responsibilities

### Frontend Core
- `src/contexts/AuthContext.tsx` - Authentication state, token validation
- `src/contexts/WorkspaceContext.tsx` - Workspace CRUD, member management, auto-loading
- `src/components/WorkspaceGuard.tsx` - Route protection, welcome screen logic
- `src/components/Layout.tsx` - Sidebar with current workspace display
- `src/App.tsx` - Route configuration with protection layers

### Backend Core  
- `apps/accounts/workspace_*.py` - Workspace models, views, serializers
- `budgetly/settings.py` - Django settings with workspace middleware
- Database includes `workspace_id` foreign keys on all financial entities

## Project-Specific Conventions

### Error Handling
- Use `react-hot-toast` for user notifications
- Backend returns `{detail: "message"}` format
- Context methods catch errors, show toasts, re-throw for component handling

### Component Patterns
- Modals: Use backdrop + portal pattern like `CreateWorkspaceModal`
- Forms: `react-hook-form` for validation + submission
- Loading states: Context-level loading for data operations

### State Management
- No Redux - Pure React Context for all state
- `localStorage` for persistence (`token`, `current_workspace_id`)
- Contexts are self-contained with full CRUD operations

## Common Tasks

### Adding New Financial Feature
1. Create Django model with `workspace = ForeignKey`
2. Add API endpoints with workspace filtering
3. Create React service in `services/`
4. Add protected route with `WorkspaceGuard`
5. Use `currentWorkspace` from context in components

### Debugging Workspace Issues
- Check browser console for workspace loading logs
- Verify `current_workspace_id` in localStorage
- Ensure API calls include proper workspace context
- Test workspace switching between different workspaces

### Backend API Testing
```bash
# Quick workspace verification
python backend/debug_workspace.py

# Database inspection  
python backend/manage.py shell
```

Remember: This system prioritizes workspace data isolation and seamless multi-tenant experience. Always consider workspace context when implementing new features. 