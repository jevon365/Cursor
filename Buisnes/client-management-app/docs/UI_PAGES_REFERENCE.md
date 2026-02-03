# Management App — UI Pages Reference

This document describes each **page** in the unified management app: its functionality, the design intent behind it, and an example of how it fits into a real workflow.

---

## Authentication & Entry

### Login

**Functionality:** Single sign-in for all users (clients and admins). User enters email and password; the app validates credentials, stores a JWT, and redirects to the Dashboard. Role is determined by the account, not by a separate “admin” URL.

**Design:** One entry point so clients and admins use the same URL and form. Centered card layout keeps focus on the form; links to Register and short copy explain that admins use the same login. Error and loading states keep the user informed.

**Workflow example:** A client opens the app, enters their email and password, and lands on the Dashboard where they see their projects and requests. An admin uses the same Login page; after sign-in they see the same shell but with extra nav items (Workspaces, Tasks, Users) and org-wide data.

---

### Register

**Functionality:** Self-service account creation. User provides name, email, password, and confirm password. The app creates a **client** account only; admins are created via User Management or seed/API. If the user is already logged in, they are logged out so another person can register.

**Design:** Simple, focused form with inline validation (password match, min length). Copy and link to Login make the flow clear. “User already exists” is surfaced as a clear, actionable error.

**Workflow example:** A new stakeholder visits the app, clicks “create an account,” fills in name and email, sets a password, and submits. They are logged in and sent to the Dashboard. Later, an admin promotes them to admin from the User Management page if needed.

---

## Home & Overview

### Dashboard

**Functionality:** Post-login home. Shows role-aware stats (e.g. project count, request count, pending requests, active tasks) and a simple “recent activity” feed (recent projects and requests). Quick-action buttons (New Project, New Request, New Task, View Kanban) and, for admins, a small bar chart of project status. Stats and activity link through to the relevant list or detail pages.

**Design:** One place to see “what’s going on” and jump into work. Admins see org-wide numbers; clients see only their data. Quick actions reduce navigation steps; links from numbers and activity support drill-down.

**Workflow example:** An admin starts their day on the Dashboard, sees “12 pending requests” and “5 active projects,” and clicks “View Kanban” to triage tasks. A client opens the app, sees “2 projects” and “3 requests,” and clicks a recent request to check status and add a comment.

---

## Projects

### Projects (list)

**Functionality:** Lists all projects the user can access (clients: their projects; admins: all). Supports search by title, filters (status, priority, workspace), sort (e.g. date, title, status), and pagination. Admins can select multiple projects and run bulk status updates (e.g. archive). CSV export is available. Each row links to the project detail; admins also get an Edit action.

**Design:** Table layout for scanability; filters and sort for narrowing and ordering. Bulk actions and export support admin workflows; role-based columns and actions keep the UI appropriate for client vs admin.

**Workflow example:** An admin needs to archive finished work: they open Projects, filter by status “completed,” select several rows, choose “Archive” from bulk actions, and confirms. A client opens Projects to see their two active projects and clicks one to open Project Detail.

---

### Project Detail

**Functionality:** Single project view: title, status, priority, tags, and (for admins) client and workspace. Shows linked requests and tasks (admins see tasks). Comments section lists existing comments and a form to add new ones. Admins can Edit or Delete (with confirmation). Admins can assign or change the client via an "Assign client" / "Change client" button that opens a modal to select a client.

**Design:** One place to see project context, related work, and discussion. Comments keep communication tied to the project; request/task links support traceability. Destructive actions are gated by confirmation. New clients get access when an admin assigns them to a project (via the Assign client modal or Create/Edit Project).

**Workflow example:** A client opens a project to see why it’s “on-hold,” reads the latest comment from the admin, and adds a reply with the missing info. An admin opens the same project, sees linked requests and tasks, clicks Assign client to assign or change the client, updates status to “active,” and adds a comment that work has resumed.

---

### Create Project

**Functionality:** Admin-only form to create a project. Fields include title, description, status, priority, client, workspace, and tags. On submit, the app creates the project and redirects to the new project’s detail page (or list). Validation and toasts handle errors and success.

**Design:** Standard CRUD form with clear required fields and validation. Success path leads to the new resource so the admin can immediately add requests or tasks.

**Workflow example:** An admin kicks off a new engagement: they go to Projects → “New Project,” enter title and client, pick a workspace, set status “active” and priority “high,” and save. They land on Project Detail and use “New Request” or the Tasks area to add initial work.

---

### Edit Project

**Functionality:** Admin-only form to update an existing project. Same fields as Create; form is pre-filled from the project. Submit updates the project and redirects to Project Detail (or list). Delete is available with confirmation.

**Design:** Mirrors Create for consistency; pre-fill reduces re-entry. Edit and Delete live on the same page so the admin can change metadata or remove the project in one place.

**Workflow example:** A project is put on hold: the admin opens Project Detail, clicks Edit, changes status to “on-hold,” adds a note in description or in a comment, and saves. Later they return, edit again, and set status back to “active.”

---

## Requests

### Requests (list)

**Functionality:** Lists all requests the user can access (clients: their requests; admins: all). Search, filters (status, category, priority, project), sort, and pagination. Admins can bulk-update status (e.g. mark several as “in-progress”). CSV export. Rows link to Request Detail; admins can edit or update status from the list or detail.

**Design:** Same list pattern as Projects for consistency. Filters and bulk status help admins triage; clients get a clear view of their own requests and a prominent "New Request" path (client-only; admins do not create requests).

**Workflow example:** An admin triages the queue: they filter by status “new,” sort by priority, select the top five, and bulk-set status to “in-progress.” A client filters by “in-progress” to see what’s being worked on and opens one to add a comment.

---

### Request Detail

**Functionality:** Single request view: title, description, status, priority, category, and project link. Admins can change status (e.g. new → in-progress → completed). Comments list and comment form allow discussion. Admins can Edit or Delete with confirmation. Admins see a "Create task from this request" button that links to Create Task with project and request pre-filled.

**Design:** Combines request metadata, status control, and discussion in one place. Status changes and comments are visible together so clients and admins stay aligned.

**Workflow example:** A client submits a change request, then later opens Request Detail to see it’s “in-progress” and reads an admin comment: “Scheduled for next sprint.” They add a reply. The admin opens the request, clicks "Create task from this request" to add a linked task, completes the work, sets status to “completed,” and adds a closing comment.

---

### Create Request

**Functionality:** Form for **clients only** to submit a new request (admins do not create requests; they triage and create tasks from requests). User selects a project, enters title and description, and sets category and priority. Submit creates the request and redirects to Request Detail or the requests list. Validation and toasts handle errors and success. The "New Request" nav link and button are shown only to users who have the client role and not the admin role.

**Design:** Short, linear flow: pick project, describe the ask, set category/priority, submit. Project dropdown restricts to projects the user can access.

**Workflow example:** A client needs a new feature: they go to Requests → “New Request,” choose the relevant project, enter “Add export to CSV,” pick category “feature” and priority “medium,” and submit. They are taken to the new request and can add a follow-up comment or share the link with the admin.

---

## Workspaces (admin)

### Workspaces (list)

**Functionality:** Admin-only list of workspaces. Each card shows name, description, and project count and links to Workspace Detail. “New Workspace” opens the create flow.

**Design:** Grid of cards for quick scanning; project count gives a sense of size. Single primary action (new workspace) keeps the page simple.

**Workflow example:** An admin organizes work by client: they open Workspaces, see “Acme Corp” (5 projects) and “Beta Inc” (3 projects), and click “Acme Corp” to see its projects and add or reassign projects.

---

### Workspace Detail

**Functionality:** Admin-only view of one workspace: name, description, and list of projects in that workspace. Links to each project and to Edit Workspace. No inline add/remove of projects here; that’s done in Edit.

**Design:** Read-focused view of workspace membership. Edit is the path to change which projects belong to the workspace.

**Workflow example:** An admin opens “Acme Corp” to verify which projects are in it, then clicks “Edit” to move one project to another workspace or add a new project to this workspace.

---

### Create Workspace / Edit Workspace

**Functionality:** Admin-only forms to create or update a workspace. Fields: name, description, and (in Edit) which projects belong to the workspace. Create redirects to the new workspace’s detail or the list; Edit saves and returns to detail or list.

**Design:** Simple resource form; Edit’s project multiselect makes membership explicit. Same mental model as Create/Edit Project.

**Workflow example:** An admin sets up a new client: they create a workspace “New Client Co,” then create projects under it or later edit the workspace to assign existing projects to it.

---

## Tasks & Kanban (admin)

### Tasks (list / Kanban)

**Functionality:** Admin-only tasks page with default Kanban view and optional List view (toggle). Filters: project, assignee (including “Unassigned”), priority, status. List or card view; clicking a task opens Task Modal (or Task Detail) for quick view/edit. “New Task” and a link to the Kanban board. Tasks load with project and assignee info for display and filters.

**Design:** Default Kanban for visual workflow; List view for filter-focused scanning. Shared filters and "New Task" in both views.

**Workflow example:** An admin needs to assign unassigned work: they open Tasks, filter by “Unassigned,” open a task in the modal, set assignee and due date, and close. They repeat for a few more, then switch to Kanban to drag tasks through “In Progress” and “Review.”

---

### Task Detail

**Functionality:** Admin-only full-page view of one task: title, description, status, priority, assignee, due date, and links to project and request. Comments list and form. Edit and Delete with confirmation. Used when the task needs full attention or shared discussion.

**Design:** Deeper view than the modal; supports longer descriptions and comment threads. Same comment pattern as Project and Request Detail.

**Workflow example:** An admin opens a high-priority task to read the full context and comments, updates status to “in-progress,” assigns themselves, sets a due date, and adds a comment that they’re starting work. Later they return to the same page to move it to “review” and add a summary comment.

---

### Create Task

**Functionality:** Admin-only form to create a task. Fields: project (required), optional request link, title, description, status, priority, assignee, due date. Submit creates the task and redirects to Task Detail or the tasks list.

**Design:** Task is always tied to a project; optional request link supports “request → tasks” traceability. Assignee and due date support ownership and planning.

**Workflow example:** An admin breaks a request into work: they open the request, then go to Tasks → “New Task,” select the same project and request, enter “Implement CSV export,” set assignee and due date, and save. They create a second task for “Add tests” and leave it unassigned for the Kanban triage.

---

### Kanban Board

**Functionality:** The Kanban board is the default view on the Tasks page (see Tasks list/Kanban above). Visiting /tasks shows Kanban by default; a view toggle allows switching to List. The /kanban URL redirects to /tasks. Admin-only. Columns (e.g. Todo, In Progress, Review, Done). Tasks appear as cards in columns; drag-and-drop moves a task to another column and updates its status via the API. Filters (project, assignee, priority) narrow the board. Clicking a card opens Task Modal. Uses @dnd-kit for drag-and-drop and keyboard support.

**Design:** Visual workflow so status updates are quick and prioritization is visible. Filters keep the board focused; modal allows edits without losing place. Column highlight on drag gives clear feedback.

**Workflow example:** An admin runs a standup: they open the Kanban board, filter by “This week’s project,” drag two tasks from “Todo” to “In Progress,” open one card to set assignee and due date, and drag a finished task from “Review” to “Done.” The board reflects current state for the whole team.

---

## User Management (admin)

### User Management

**Functionality:** Admin-only list of all users. Table shows name, email, roles, created date. Search by name/email/role, sort, pagination. “Promote to Admin” / “Demote to Client” per user, with confirmation; the current user cannot change their own role. Role updates call the API and refresh the list; toasts show success or error.

**Design:** Single place to see who has access and which role they have. Promote/demote with confirmation reduces mistakes; blocking self-role-change prevents lockout. Search and sort help in larger teams.

**Workflow example:** A team member should become an admin: the admin opens User Management, finds the user, clicks “Promote to Admin,” confirms in the modal. The user’s next login shows admin nav and org-wide data. To revoke admin, the admin finds them again and clicks “Demote to Client.”

---

## Account (all authenticated users)

### Account

**Functionality:** User-managed account page. Two main areas: (1) Change password (current password, new password, confirm) with validation and API call; (2) Delete account, which requires password confirmation in a modal and then calls the delete API, logs out, and redirects to Login. Read-only display of user email/name. Loading and error states for both flows.

**Design:** Sensitive actions (password change, account deletion) require current password and clear confirmation. Delete is separated and modal-based to avoid accidental use. Accessible from the nav for every logged-in user.

**Workflow example:** A user wants to change their password: they open Account, enter current password and new password twice, submit, and see a success toast. Another user decides to leave: they open Account, go to the delete section, enter their password, confirm in the modal, and are logged out and redirected to Login.

---

## Summary: Pages by role and workflow

| Page            | Who uses it     | Main purpose                          | Example workflow step                    |
|-----------------|-----------------|----------------------------------------|------------------------------------------|
| Login           | Everyone        | Sign in                                | Client or admin signs in once            |
| Register        | New users       | Create client account                  | New stakeholder creates account          |
| Dashboard       | Everyone        | Overview and quick actions             | Admin checks pending count, opens Kanban |
| Projects        | Everyone        | List/filter/export projects             | Admin archives completed projects        |
| Project Detail  | Everyone        | View project, requests, tasks, comments| Client checks why project is on-hold     |
| Create Project  | Admin           | Create project                         | Admin creates project for new client     |
| Edit Project    | Admin           | Update or delete project               | Admin sets project to on-hold            |
| Requests        | Everyone        | List/filter/export requests             | Admin bulk-sets requests in progress     |
| Request Detail  | Everyone        | View request, status, comments          | Client adds comment on their request     |
| Create Request  | Client only     | Submit new request                     | Client submits feature request           |
| Workspaces      | Admin           | List workspaces                        | Admin opens workspace by client          |
| Workspace Detail| Admin           | View workspace and its projects        | Admin checks membership, then edits      |
| Create/Edit Workspace | Admin     | Create or edit workspace               | Admin creates “New Client” workspace     |
| Tasks           | Admin           | Kanban (default) or list, quick edit    | Admin assigns unassigned tasks           |
| Task Detail     | Admin           | Full task view and comments            | Admin updates status and adds comment    |
| Create Task     | Admin           | Create task                            | Admin creates task from a request       |
| Kanban Board    | Admin           | Visual workflow, drag status           | Admin moves tasks through columns        |
| User Management | Admin           | View users, promote/demote roles        | Admin promotes user to admin             |
| Account         | Everyone        | Change password, delete account        | User changes password or deletes account |

---

*This reference is for the unified management app (single codebase, role-based access). Use it to onboard, design flows, or plan changes (e.g. new pages or workflow tweaks).*
