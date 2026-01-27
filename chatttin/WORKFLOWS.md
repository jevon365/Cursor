# Successful Workflows & Patterns

**Document workflows that work well with Cursor AI for future reference.**

## Workflow Templates

### Pattern: [Name of Pattern]

**When to use:**
- [When this pattern is useful]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Example prompt:**
```
[Example of a prompt that worked well]
```

**Why it works:**
- [What made this effective]

**Result:**
- [What you got from this]

---

### Pattern: Progressive Planning for Multi-App Architecture

**When to use:**
- Starting a new project with unclear requirements
- Need to decide between single app vs multiple apps
- Security and deployment strategy unclear
- Want to avoid rework from wrong initial decisions

**Steps:**
1. Start with generic project template/checklist
2. Ask clarifying questions about:
   - User types and access needs
   - Security requirements
   - Deployment target
   - Data sharing needs
3. Update plan based on answers (don't code yet)
4. Iterate until architecture is clear
5. Then initialize project structure
6. Create service layer patterns
7. Set up shared backend API
8. Configure environment and dependencies

**Example prompt:**
```
Im working on my file structure and wanting to make innital plans for a new project 
in the buisness folder. what are some additional first steps that i should take and 
what are good best practices for developing a project
```

Then follow up with specifics:
```
ok it seems that the phases need to be ajusted, and that a single app running on 
github will not be sufficent for this project. thus multipul apps with a shared 
database would be the best course. app 1 is client facing, they have a login and 
can put in requests for changes in their project, I can comment on those changes 
and the clent can see how progress is going on the changes. App 2 is a project 
manegment app that shares a database with app 1...
```

**Why it works:**
- Prevents building wrong architecture
- Saves time by clarifying requirements first
- Allows agent to understand full context before coding
- Creates better documentation and structure
- Identifies security concerns early (localStorage vs database)

**Result:**
- Clear architecture decision (two apps + shared backend)
- Proper security approach from start
- Scalable structure for future features
- Comprehensive setup in one session
- Documentation that helps future agents

**Project:** Management App - Initial Setup
**Date:** 2026-01-21

---

### Pattern: Service Layer Architecture for React Apps

**When to use:**
- Building React apps that consume APIs
- Need consistent error handling
- Want to abstract API details from components
- Need token management
- Planning to switch between localStorage and API

**Steps:**
1. Create `services/api.js` with axios instance
2. Add request interceptor for token injection
3. Add response interceptor for error handling
4. Create service files per resource (authService, projectService, etc.)
5. Export service functions from each file
6. Import services in components/hooks

**Example structure:**
```javascript
// services/api.js
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  response => response,
  error => { /* handle 401, redirect to login */ }
);

// services/authService.js
export const authService = {
  login: async (email, password) => { /* ... */ },
  logout: () => { localStorage.removeItem('token'); },
  getCurrentUser: () => { /* ... */ }
};
```

**Why it works:**
- Centralized API configuration
- Automatic token management
- Consistent error handling
- Easy to test (mock services)
- Can switch data sources without changing components

**Result:**
- Clean component code (no axios calls in components)
- Reusable API client pattern
- Easy to add new API endpoints
- Better error handling
- Easier testing and mocking

**Project:** Management App - Service Layer Setup
**Date:** 2026-01-21

---

## Common Tasks

### Task: [Task Name]

**Best approach:**
- [How to do this task with Cursor]

**Example:**
- [Example interaction]

---

## Lessons Learned

### What Works Well

- [Pattern 1]
- [Pattern 2]

### What Doesn't Work

- [Anti-pattern 1]
- [Anti-pattern 2]

---

*Add successful patterns as you discover them*
