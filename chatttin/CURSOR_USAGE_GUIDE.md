# Cursor Usage Guide & Documentation

**Created:** January 19, 2026  
**Purpose:** Track how you use Cursor AI and document best practices for future reference

---

## How You've Been Using Cursor (Current State)

Based on your `.cursorrules` file and setup, here's what I can observe:

### ✅ What You're Doing Well

1. **Communication Preferences Documented**
   - You have a `.cursorrules` file that guides AI behavior
   - Clear preferences: ELI5 style, concise, practical
   - Background context provided (Data Analyst, Applied Economics)

2. **Using Core Features**
   - Chat interface (Ctrl+L)
   - Inline editing (Ctrl+K)
   - Composer mode (Ctrl+I)

3. **Clear Expectations**
   - Want to understand WHY, not just WHAT
   - Prefer code examples over theory
   - Want solutions that match your coding style

### ⚠️ Areas for Improvement

1. **Limited Context Awareness**
   - No evidence of using workspace-specific documentation
   - Chat history not being saved/exported for reference
   - Missing project-specific context files

2. **Underutilized Features**
   - Composer mode (Ctrl+I) - great for multi-file changes
   - Code selection + Ctrl+L - for targeted questions
   - Agent/router system - you're using "Auto" (me) but could explore other models

3. **No Documentation of Workflows**
   - No record of successful patterns
   - No troubleshooting notes
   - No saved examples of good interactions

---

## Understanding "Cursor" vs Multiple Models

### The Confusion

**"Cursor" is the IDE/application**, not the AI model. The chat window uses **different AI models** depending on what you're doing:

- **Auto (Current Agent)**: Routes to the best model for your task (Claude Sonnet, GPT-4, etc.)
- **Claude Sonnet**: Good for code understanding, explanations
- **GPT-4**: Strong for complex reasoning, multi-step tasks
- **Claude Opus**: Best for deep analysis, long context
- **GPT-3.5**: Faster, cheaper, good for simple tasks

### What to Call It?

**Better terminology:**
- ✅ "Cursor chat" or "the chat window" - refers to the interface
- ✅ "The AI assistant" or "the agent" - refers to the model
- ✅ "Auto" - refers to the routing system (what you're using now)
- ❌ Just "Cursor" - too vague, could mean the app or the AI

**In practice:** When talking about interactions, say "I asked the AI assistant in Cursor" or "I used Cursor's chat to..."

---

## Where Chat History is Stored

### Files I Would Need to Access Your Communications

**Primary Locations:**

1. **Global Chat History (All Workspaces)**
   - `C:\Users\jevon\AppData\Roaming\Cursor\User\globalStorage\state.vscdb`
     - SQLite database containing all chat conversations
     - Includes model used, timestamps, full conversation threads
   - `C:\Users\jevon\AppData\Roaming\Cursor\Local Storage\leveldb\`
     - LevelDB database (binary format)
     - Browser-like local storage for chat data

2. **Workspace-Specific Storage**
   - `C:\Users\jevon\AppData\Roaming\Cursor\User\workspaceStorage\[workspace-hash]\`
     - Each workspace gets a unique hash folder
     - May contain workspace-specific chat context
     - JSON files with conversation metadata

3. **Logs (Less Useful)**
   - `C:\Users\jevon\AppData\Roaming\Cursor\logs\`
     - Application logs, not chat history
     - Timestamped folders (e.g., `20260119T205643`)

### How to Access This Data

**Option 1: SQLite Browser (Recommended)**
- Download DB Browser for SQLite (free)
- Open `state.vscdb`
- Look for tables like `conversations`, `messages`, `chat_history`
- Export to JSON/CSV for analysis

**Option 2: Cursor's Built-in History**
- Check if Cursor has a chat history UI (varies by version)
- Look for "History" or "Previous Conversations" in chat panel

**Option 3: Export Conversations**
- Manually copy important conversations to markdown files
- Create a `conversations/` folder in your workspace
- Save key interactions for future reference

---

## Recommendations to Get More Out of Cursor

### 1. **Create Project-Specific Context Files**

**Create these in your workspace:**

```
.cursorrules          # Already have this ✅
PROJECT_CONTEXT.md    # Project-specific info
WORKFLOWS.md          # Document successful patterns
TROUBLESHOOTING.md    # Common issues & solutions
```

**Why:** Helps AI understand your project better, gives consistent context across sessions

**Real Example from Your Circus Game Project:**

You've been doing this really well! Your `circus-maximus` project has:

**`README.md`** - Comprehensive guide for AI agents:
- Game overview and mechanics
- Project structure
- Architecture decisions
- Implementation status
- Common pitfalls
- Code patterns

**`IMPLEMENTATION_STATUS.md`** - Tracks what's done:
- ✅ Completed features
- ⏳ Pending work
- 📋 TODO items
- Current state summary

**`CRITIQUE_AND_TASKS.md`** - Task breakdown:
- Task groups with completion status
- File locations for changes
- Code patterns to follow
- Testing checklists

**Result:** When you (or a new AI agent) opens the project, everything is documented. No guessing what's done or what needs work.

**What You Did Right:**
- Documented architecture decisions (why turn order uses indices, not player array)
- Listed common pitfalls (mutating players array)
- Included file locations and line numbers for changes
- Tracked completion status clearly
- Created "For Future Agents" section in README

**How to Apply This:**
1. Start every project with a README explaining the "why"
2. Keep an implementation status file updated
3. Document patterns that work (and anti-patterns to avoid)
4. Include specific file/line references when describing changes

**Real Example from Your Circus Game Project:**

You've been doing this really well! Your `circus-maximus` project has:

**`README.md`** - Comprehensive guide for AI agents:
- Game overview and mechanics
- Project structure
- Architecture decisions
- Implementation status
- Common pitfalls
- Code patterns

**`IMPLEMENTATION_STATUS.md`** - Tracks what's done:
- ✅ Completed features
- ⏳ Pending work
- 📋 TODO items
- Current state summary

**`CRITIQUE_AND_TASKS.md`** - Task breakdown:
- Task groups with completion status
- File locations for changes
- Code patterns to follow
- Testing checklists

**Result:** When you (or a new AI agent) opens the project, everything is documented. No guessing what's done or what needs work.

**What You Did Right:**
- Documented architecture decisions (why turn order uses indices, not player array)
- Listed common pitfalls (mutating players array)
- Included file locations and line numbers for changes
- Tracked completion status clearly
- Created "For Future Agents" section in README

**How to Apply This:**
1. Start every project with a README explaining the "why"
2. Keep an implementation status file updated
3. Document patterns that work (and anti-patterns to avoid)
4. Include specific file/line references when describing changes

---

### 2. **Use Composer Mode More (Ctrl+I)**

**When to use:**
- Making changes across multiple files
- Refactoring code
- Adding features that touch several components
- Large-scale code improvements

**Why:** Composer sees the full context and can make coordinated changes

**Real Example from Your Circus Game: Implementing Location Effects**

**Scenario:** You needed to implement all 11 location effects from the rulebook, which required changes across multiple files.

**Files that needed changes:**
- `js/game/GameState.js` - Add resource supply system, market queues
- `js/game/GameEngine.js` - Add location effect handlers
- `js/game/Board.js` - Update worker placement logic
- `js/game/Phases.js` - Update turn order for markets
- `js/utils/config.js` - Add location configurations
- `js/game/EventCardManager.js` - Add peek method for Oracle

**What You Did (Based on CRITIQUE_AND_TASKS.md):**
You broke it into task groups and documented each one, but you could have used Composer mode to implement multiple related changes at once.

**Better Approach with Composer:**
1. Press `Ctrl+I` (Composer mode)
2. Say: "Implement all location effects from the rulebook. This requires:
   - Add resource supply system to GameState (mummers, animals, slaves, prisoners, workers)
   - Add location effect handlers to GameEngine (gainResource, coinFlip, trackMovement, resourceConversion, information)
   - Update Board.js to handle Prison's maxWorkersTotal limit
   - Add market queue tracking when workers placed at markets
   - Update Phases.js to use market queue order in buyResources phase
   - Add peekTopEvent() method to EventCardManager for Oracle
   - Update config.js with all location effect types
   - Follow existing code patterns (see README.md)"
3. Composer sees all files and makes coordinated changes

**Result:** All location effects implemented together, consistent patterns, proper state management - saves hours of manual coordination.

**What You Actually Did (Still Good!):**
- Broke work into logical task groups (Task Groups 1-5)
- Documented each completion in CRITIQUE_AND_TASKS.md
- Included file locations and line numbers
- Tracked what worked and what didn't

**Takeaway:** Composer mode would have made this faster, but your documentation approach is excellent for complex features that need careful testing.

---

### 3. **Select Code Before Asking Questions**

**Instead of:** "What does this function do?"  
**Do:** Select the function → Ctrl+L → "What does this do?"

**Why:** AI gets exact context, can reference specific lines, gives better answers

**Real Examples:**

**Example 1: Understanding Complex SQL Query**

**Bad approach:**
```
You: "What does my SQL query do?"
AI: [Generic explanation, might miss your specific logic]
```

**Good approach:**
```sql
-- Select this entire query
SELECT 
    c.customer_name,
    SUM(t.amount) as total_revenue,
    COUNT(DISTINCT t.product_id) as products_purchased,
    AVG(t.amount) as avg_transaction
FROM customers c
JOIN transactions t ON c.id = t.customer_id
WHERE t.date >= DATEADD(month, -3, GETDATE())
GROUP BY c.customer_name
HAVING SUM(t.amount) > 1000
ORDER BY total_revenue DESC
```

Then: Select all → Ctrl+L → "Explain this query like I'm 5, and suggest optimizations"

**AI response:** "This finds customers who spent more than $1000 in the last 3 months, shows their total revenue, how many different products they bought, and average transaction size. Sorted by biggest spenders. **Optimization:** Add index on `transactions.date` and `transactions.customer_id`."

**Example 2: Understanding React Component**

**Bad:**
```
You: "Why isn't my chart updating?"
AI: [Guesses what might be wrong]
```

**Good:**
```jsx
// Select this component
const SalesChart = ({ data, dateRange }) => {
  const [filteredData, setFilteredData] = useState(data);
  
  useEffect(() => {
    // This might be the issue
    setFilteredData(data.filter(d => 
      d.date >= dateRange.start && d.date <= dateRange.end
    ));
  }, [data]); // Missing dateRange dependency!
  
  return <LineChart data={filteredData} />;
};
```

Select → Ctrl+L → "Why isn't this chart updating when dateRange changes?"

**AI response:** "Your `useEffect` is missing `dateRange` in the dependency array. When `dateRange` changes, the effect doesn't run. Add `dateRange` to the array: `[data, dateRange]`"

**Example 3: Understanding Game Engine Logic (From Your Circus Game)**

**Bad:**
```
You: "How does the turn order work?"
AI: [Generic explanation, might miss your specific implementation]
```

**Good:**
```javascript
// Select this code from Phases.js
setTurnOrder(gameState, method) {
    if (method === 'empire') {
        return gameState.players
            .map((p, i) => ({ index: i, value: p.getTrack('empire') }))
            .sort((a, b) => b.value - a.value)
            .map(item => item.index);
    }
    // ... more methods
}
```

Select → Ctrl+L → "Explain this turn order logic. Why use indices instead of sorting the players array directly? Show me how this prevents bugs."

**AI response:** Explains that using indices prevents player ID confusion, maintains player object references, and works correctly with save/load. Points to your README's "Common Pitfalls" section that warns against mutating the players array.

**Real Example from Your Project:**
Your `CRITIQUE_AND_TASKS.md` shows you've been doing this - you reference specific files and line numbers:
- "Location: `GameEngine.js` line 216-226"
- "Location: `Phases.js` line 233-280"

This is exactly the right approach! When you select code and ask questions, you get answers specific to YOUR implementation.

---

### 4. **Document Successful Patterns**

**Create a `SUCCESSFUL_PATTERNS.md` file:**
- What questions worked well?
- What prompts got the best results?
- What workflows saved you time?

**Real Examples from Data Analysis Work:**

**Pattern 1: SQL Query Optimization**
```markdown
## Pattern: Optimizing Slow SQL Queries

**Prompt:** 
"Analyze this query's execution plan and suggest optimizations. 
Show me the EXPLAIN output interpretation."

**Result:** Got specific index recommendations and query restructuring

**When to use:** When queries take >5 seconds

**Example:**
- Selected slow query → Ctrl+L → Used prompt above
- Got 3 index suggestions + query rewrite
- Reduced query time from 12s to 0.8s
```

**Pattern 2: React Component Debugging**
```markdown
## Pattern: Fixing State Update Issues

**Prompt:**
"Explain why this state isn't updating. Show me the React DevTools 
breakdown and fix it."

**Result:** Identified missing dependencies, stale closures, or 
incorrect state updates

**When to use:** When useState/useEffect behaves unexpectedly

**Example:**
- Selected component with state issue
- Got explanation of closure problem
- Fixed with useCallback/useMemo pattern
```

**Pattern 3: Implementing Game Features (From Your Circus Game)**
```markdown
## Pattern: Implementing Location Effects

**Prompt:**
"Implement [location name] effect from rulebook. Requirements:
- Effect type: [gainResource/coinFlip/trackMovement/etc]
- Validation needed: [what to check before allowing]
- State changes: [what gets updated]
- Follow patterns in GameEngine.handleLocationEffect()
- Update CRITIQUE_AND_TASKS.md when done"

**Result:** Complete implementation with proper error handling

**When to use:** Adding new location effects or game mechanics

**Example from your project:**
You documented this pattern in CRITIQUE_AND_TASKS.md:
- Task Group 2: Simple Resource Gain Locations
- Task Group 3: Coin Flip Location Effects
- Task Group 4: Track Movement Locations
- Each with specific file locations and code patterns
```

**Pattern 4: Debugging Game Logic**
```markdown
## Pattern: Fixing Game State Bugs

**Prompt:**
"Debug this issue: [describe bug]. Check:
- GameState serialization (save/load still works?)
- Turn order mutations (using indices, not player array?)
- Phase transitions (proper cleanup?)
- Location: [file] lines [X-Y]"

**Result:** Identified root cause + fix + verification steps

**When to use:** When game state behaves unexpectedly

**Example from your project:**
Your README has a "Common Pitfalls" section that documents known issues:
- Mutating players array
- Market restock timing
- Worker reset order
- This helps AI agents (and you) avoid repeating mistakes
```

---

### 5. **Use Different Models for Different Tasks**

**Try switching models:**
- **Claude Sonnet**: Code explanations, understanding existing code
- **GPT-4**: Complex logic, multi-step problem solving
- **Claude Opus**: Deep analysis, architectural decisions

**How:** In chat, you can usually select the model from a dropdown or use `@model-name`

**Real Examples:**

**Task: Understanding Complex R Statistical Model**

**Use Claude Sonnet:**
```
Prompt: "Explain this regression model output step-by-step"
Model: Claude Sonnet
Why: Better at explaining code and statistical concepts clearly
```

**Task: Implementing Complex Game System (From Your Circus Game)**

**Use GPT-4:**
```
Prompt: "Design the market queue system for Buy Resources phase:
1. Track workers placed at markets during Place Workers phase
2. Validate players have workers in markets before buying
3. Set turn order based on market queue placement order
4. Handle players in multiple market queues (earliest position wins)
5. Update Phases.js, GameEngine.js, and GameState.js"

Model: GPT-4
Why: Better at complex, multi-step reasoning across multiple files

**What You Actually Did:**
You documented this in CRITIQUE_AND_TASKS.md as Task Group 6:
- Task 6.1: Market queue tracking ✅
- Task 6.2: Buy Resources phase validation ✅
- Task 6.3: Phase turn order for markets ✅
- Each with specific file locations and implementation notes
```

**Task: Architectural Decision for Dashboard**

**Use Claude Opus:**
```
Prompt: "Should I use Redux or Context API for this dashboard's 
state management? Consider: 5 components, real-time updates, 
user preferences storage."

Model: Claude Opus
Why: Better at deep analysis and trade-off evaluation
```

**Task: Quick SQL Syntax Check**

**Use GPT-3.5:**
```
Prompt: "Fix the syntax error in this SQL query"
Model: GPT-3.5
Why: Faster, cheaper, good for simple fixes
```

---

### 6. **Save Important Conversations**

**Create a `conversations/` folder:**
```
conversations/
  ├── 2026-01-19-project-setup.md
  ├── 2026-01-19-debugging-issue.md
  └── 2026-01-19-learning-react-patterns.md
```

**Why:** 
- Reference later when you forget solutions
- Share with team members
- Build a knowledge base

**Real Example: Saved Conversation**

**File: `conversations/2026-01-19-location-effects-implementation.md`**
```markdown
# Location Effects Implementation - Circus Game

**Date:** 2026-01-19
**Topic:** Implemented all 11 location effects from rulebook
**Model Used:** Auto (Claude Sonnet)
**Time Saved:** 4+ hours

## Problem
Need to implement location effects: Prison, Port, War, Forest, Town Square, 
Palace, Pantheon, Guildhall, Oracle, and 3 market locations.

## Solution
AI helped break into task groups:
1. Resource Supply System (Task Group 1)
2. Simple Resource Gain (Task Group 2) 
3. Coin Flip Effects (Task Group 3)
4. Track Movement (Task Group 4)
5. Special Actions (Task Group 5)

## Code Changes
- GameState.js: Added resourceSupply, marketQueues, temporaryTrackMovements
- GameEngine.js: Added handleLocationEffect() and all effect handlers
- Board.js: Updated for Prison's maxWorkersTotal
- Phases.js: Added market queue turn order

## Result
All 11 locations fully functional with proper validation and error handling.

## Key Learnings
- Centralized effect handler prevents code duplication
- Resource supply separate from markets (per rulebook)
- Worker death mechanics need cost refund + space reuse
- Market queues tracked during placement, used in buyResources phase

## When to Reuse
- Adding new location effects
- Implementing similar game mechanics
- Reference: CRITIQUE_AND_TASKS.md Task Groups 1-5
```

**Why this helps:** Your `CRITIQUE_AND_TASKS.md` already serves this purpose! It documents:
- What was completed
- File locations for changes
- Code patterns to follow
- Testing checklists

**Suggestion:** Save a conversation file when you discover a pattern that works really well, even if you've documented it elsewhere. The conversation shows the THINKING process, not just the result.

---

### 7. **Use Inline Editing (Ctrl+K) More**

**When to use:**
- Quick fixes
- Small refactors
- Adding comments
- Formatting code

**Why:** Faster than chat for simple edits, keeps you in the flow

**Real Examples:**

**Example 1: Quick SQL Fix**

**Scenario:** You have a typo in a column name

**Bad approach:**
- Open chat (Ctrl+L)
- Type: "Fix the typo in my SQL query"
- Wait for response
- Copy code back
- Paste and adjust

**Good approach:**
- Select the line with typo
- Press `Ctrl+K`
- Type: "Fix typo: 'custmer_name' should be 'customer_name'"
- AI fixes it inline
- Continue coding

**Example 2: Adding Comments to Game Logic (From Your Circus Game)**

**Scenario:** You want to document why turn order uses indices

**Select this code:**
```javascript
// From Phases.js
gameState.turnOrder = gameState.players
    .map((p, i) => ({ index: i, value: p.getTrack('empire') }))
    .sort((a, b) => b.value - a.value)
    .map(item => item.index);
```

**Press Ctrl+K, type:**
```
Add a comment explaining why we use indices instead of sorting the players array directly. Reference the README's Common Pitfalls section.
```

**Result:**
```javascript
// Use indices instead of sorting players array directly to prevent player ID confusion
// and maintain proper references for save/load. See README "Common Pitfalls"
gameState.turnOrder = gameState.players
    .map((p, i) => ({ index: i, value: p.getTrack('empire') }))
    .sort((a, b) => b.value - a.value)
    .map(item => item.index);
```

**Example 3: Formatting Game Component**

**Select messy code:**
```javascript
const handleLocationEffect=(location,player)=>{if(location.effectType==='coinFlip'){const result=Math.random()<0.5;if(result){player.addResource('mummers',2);}else{player.workers.available++;return{success:true,workerDied:true};}}}
```

**Press Ctrl+K, type:**
```
Format this function properly with proper spacing, line breaks, and add JSDoc comment explaining the return structure
```

**Result:** Properly formatted, readable code with documentation.

---

### 8. **Ask for Explanations, Not Just Code**

**Good prompts:**
- "Explain why this approach is better than [alternative]"
- "What are the trade-offs of this solution?"
- "How would this scale if we had 10x more data?"

**Why:** You learn the reasoning, not just copy code

**Real Examples:**

**Example 1: SQL JOIN Strategy**

**Bad prompt:**
```
"Write a query to join customers and transactions"
```

**Good prompt:**
```
"Show me 3 ways to join customers and transactions:
1. INNER JOIN
2. LEFT JOIN  
3. RIGHT JOIN

Explain when to use each, what data you get/lose, and 
performance implications. Then write the query for my use case 
(need all customers, even without transactions)."
```

**Result:** You learn:
- INNER JOIN: Only customers with transactions (loses customers with no sales)
- LEFT JOIN: All customers + their transactions (what you need)
- RIGHT JOIN: All transactions + customers (loses orphaned transactions)
- Performance: LEFT JOIN might be slightly slower, but necessary for your requirement

**Example 2: React State Management**

**Bad:**
```
"How do I store user preferences?"
```

**Good:**
```
"I need to store user dashboard preferences (theme, default date range, 
visible widgets). Should I use:
- useState + localStorage
- Context API
- Redux

Explain the trade-offs for my use case (single user, 5-10 preferences, 
needs to persist across sessions). Show me the code for the best option 
and explain why it's better than the others."
```

**Result:** You learn why `useState + localStorage` is simplest for your case, when you'd need Context (shared across components), and when Redux is overkill.

**Example 3: Game Design Decision (From Your Circus Game)**

**Bad:**
```
"Should I use immediate or batch resolution for location effects?"
```

**Good:**
```
"I'm implementing location effects for my board game. I have two approaches:

1. Immediate resolution (effects happen when worker placed)
2. Batch resolution (collect all placements, resolve after phase ends)

The reference TSX uses batch (phase 2.5), but my current code does immediate.

Show me:
1. Pros/cons of each approach
2. Which matches the rulebook better
3. Implementation differences
4. Player experience impact

Then recommend which to use and explain why."
```

**Result:** You learn the trade-offs, see implementation differences, and make an informed decision.

**What You Actually Did:**
Your `refrence material/claude-build/recommendations.md` shows you compared the reference TSX with your rulebook and documented the decision:
- "Keep project's immediate resolution. The reference's batch approach creates a 'phase 2.5' which is confusing. Immediate feedback is better for players."

This is exactly the right approach - you asked for the reasoning, not just the code!

---

### 9. **Use Code References in Your Questions**

**Instead of:** "Fix the bug in my component"  
**Do:** "Fix the bug in `components/UserProfile.tsx` lines 45-52"

**Why:** AI can see exact code, gives more accurate fixes

**Real Examples:**

**Example 1: React Component Bug**

**Bad:**
```
"My chart isn't showing data"
```

**Good:**
```
"The chart in `components/SalesChart.jsx` lines 23-35 isn't rendering 
data. The data prop is being passed correctly from the parent. 
Check the data transformation logic."
```

**AI can see:**
```jsx
// components/SalesChart.jsx
const SalesChart = ({ data }) => {
  // Line 23-35
  const chartData = data.map(d => ({
    x: d.date,
    y: d.amount
  }));
  
  return <LineChart data={chartData} />; // Might be empty array issue
};
```

**AI response:** "Your `chartData` might be empty if `data` prop is undefined on first render. Add a check: `if (!data || data.length === 0) return <EmptyState />;`"

**Example 2: SQL Query Error**

**Bad:**
```
"My SQL query has an error"
```

**Good:**
```
"Fix the syntax error in `queries/monthly_sales.sql` lines 8-12. 
The error says 'Invalid column name'."
```

**AI can see:**
```sql
-- queries/monthly_sales.sql
SELECT 
    region,
    SUM(amount) as total
FROM transactions
WHERE date >= '2025-01-01'  -- Line 8
GROUP BY region             -- Line 12
```

**AI response:** "You're grouping by `region` but `transactions` table doesn't have that column. You need to JOIN with `customers` table first to get region."

**Example 3: Game Bug Fix (From Your Circus Game)**

**Bad:**
```
"The market queue isn't working"
```

**Good:**
```
"Fix the market queue turn order in `js/game/Phases.js` lines 233-280. 
The setTurnOrder() method for 'market' should:
- Order players by earliest market queue position (across all markets)
- Players not in any market go to end
- Handle players in multiple queues (use earliest position)

Current code has TODO comment. See CRITIQUE_AND_TASKS.md Task 6.3 for requirements."
```

**AI can see:**
- The exact code that needs fixing
- The TODO comment
- Your documentation of requirements
- The pattern used in other turn order methods

**Result:** Specific fix that matches your existing code patterns.

**What You Actually Did:**
Your `CRITIQUE_AND_TASKS.md` shows you documented this exact way:
- "Task 6.3: Phase turn order for markets - ✅ COMPLETE"
- "Location: `Phases.js` line 233-280"
- "Players ordered by earliest market queue position (across all markets)"

This is the perfect approach - specific file references help AI give accurate fixes!

---

### 10. **Create a "Cheat Sheet" for Common Tasks**

**Example `CURSOR_CHEATSHEET.md`:**
```markdown
# Quick Reference

## Common Tasks
- **Explain code:** Select code → Ctrl+L → "Explain this"
- **Refactor:** Ctrl+I → "Refactor this to use hooks"
- **Debug:** Select error → Ctrl+L → "What's wrong here?"
- **Add feature:** Ctrl+I → "Add a search bar to the header"

## Best Prompts
- "Show me 3 ways to do X and explain trade-offs"
- "Explain like I'm 5, then show the code"
- "Match the style of [file]"
```

**Expanded Real-World Cheat Sheet:**

```markdown
# Cursor Cheat Sheet - Data Analysis Workflow

## SQL Tasks

**Optimize slow query:**
Select query → Ctrl+L → "Analyze performance, suggest indexes, rewrite if needed"

**Explain complex JOIN:**
Select JOIN → Ctrl+L → "Explain this join step-by-step with example data"

**Fix syntax error:**
Select error line → Ctrl+K → "Fix SQL syntax error: [paste error message]"

**Create similar query:**
Select existing query → Ctrl+L → "Create similar query for [new table/metric]"

## R Tasks

**Clean messy data:**
Select data frame → Ctrl+L → "Create cleaning pipeline: handle NAs, outliers, types"

**Explain statistical output:**
Select model output → Ctrl+L → "Explain these results like I'm 5, what do they mean?"

**Optimize slow code:**
Select slow code → Ctrl+L → "This takes 5 min, optimize using dplyr/data.table"

**Create visualization:**
Select data → Ctrl+L → "Create ggplot2 chart showing [relationship/trend]"

## React Tasks

**Fix state bug:**
Select component → Ctrl+L → "Why isn't state updating? Show React DevTools breakdown"

**Add feature:**
Ctrl+I → "Add [feature] to [component]. Match style of [existing component]"

**Debug rendering:**
Select component → Ctrl+L → "Why isn't this rendering? Check props and state"

**Refactor to hooks:**
Select class component → Ctrl+I → "Convert to functional component with hooks"

## Data Analysis Workflows

**New analysis project:**
Ctrl+I → "Set up R project structure: data/, analysis/, output/, with README"

**SQL to R conversion:**
Select SQL → Ctrl+L → "Convert this to dplyr pipeline, explain each step"

**Create dashboard:**
Ctrl+I → "Create React dashboard with [components]. Use [chart library]"

**Document findings:**
Select analysis code → Ctrl+L → "Create markdown report explaining these results"
```

---

## Next Steps

1. **Create the recommended files:**
   - `PROJECT_CONTEXT.md` - What this project does
   - `WORKFLOWS.md` - Document your workflows
   - `conversations/` folder - Save important chats

2. **Try one new feature this week:**
   - Use Composer mode for a multi-file change
   - Try a different model for a specific task
   - Select code before asking questions

3. **Start documenting:**
   - Save one conversation that was particularly helpful
   - Note what made it work well
   - Build from there

4. **Review and update:**
   - Come back to this doc monthly
   - Add what you've learned
   - Update recommendations based on experience

---

## Questions to Explore

- Which model works best for your data analysis tasks?
- What prompts get the best code generation for R/SQL?
- How can Cursor help with your Tableau/React work?
- What workflows save you the most time?

**Document your findings here as you discover them!**

---

## Analysis: How You've Been Using Cursor (Based on Circus Game Project)

### ✅ What You're Doing Really Well

**1. Comprehensive Documentation**
- Your `README.md` is excellent - it explains architecture decisions, common pitfalls, and code patterns
- `IMPLEMENTATION_STATUS.md` tracks progress clearly
- `CRITIQUE_AND_TASKS.md` breaks work into manageable task groups
- You document file locations and line numbers for changes

**2. Task Breakdown & Tracking**
- Breaking complex features into task groups (Task Groups 1-8)
- Clear completion status (✅ ⏳ ❌)
- Testing checklists for each feature
- Notes on what worked and what didn't

**3. Code Pattern Documentation**
- "Important Code Patterns" section in README
- "Common Pitfalls" section prevents repeating mistakes
- Code examples showing correct vs incorrect approaches
- "For Future Agents" section helps continuity

**4. Reference Material Organization**
- `refrence material/claude-build/` folder with comparison docs
- Comparing reference implementations with your rulebook
- Documenting decisions (why immediate vs batch resolution)

**5. Specific File References**
- Including file paths and line numbers in task documentation
- Makes it easy for AI (or you) to find exact code locations
- Example: "Location: `GameEngine.js` line 216-226"

### 🎯 Areas to Improve

**1. Use Composer Mode More**
- You're breaking work into task groups (great!)
- But you could use Composer (Ctrl+I) to implement multiple related changes at once
- Example: All location effects could be implemented together in one Composer session

**2. Save Conversation Patterns**
- You document WHAT was done, but not HOW you communicated with AI
- Save a conversation file when you discover a prompt pattern that works really well
- Example: "How I asked for location effect implementation" - shows the thinking process

**3. Reference Code Selections in Questions**
- You reference files in documentation (excellent!)
- But when asking AI questions, select the actual code first
- Example: Select the `setTurnOrder()` method → Ctrl+L → "Explain this logic"

**4. Ask for Explanations, Not Just Code**
- You're good at documenting decisions
- But when implementing, ask "why this approach?" not just "how to do it?"
- Your `recommendations.md` shows you do this - apply it more in chat

**5. Use Different Models for Different Tasks**
- You're using Auto (which is fine)
- But try GPT-4 for complex multi-file changes
- Try Claude Opus for architectural decisions (like immediate vs batch resolution)

### 📝 Recommended Next Steps

1. **Try Composer Mode** for your next feature:
   - Instead of implementing Task Groups one at a time
   - Use Ctrl+I and describe all related changes together
   - See if it saves time while maintaining quality

2. **Save One Conversation** as a template:
   - Pick a conversation where you got great results
   - Save it to `conversations/` folder
   - Note what made it work well

3. **Select Code Before Asking**:
   - When you have a question about existing code
   - Select the code first, then ask
   - You'll get answers specific to YOUR implementation

4. **Experiment with Models**:
   - Try GPT-4 for complex features (like market queue system)
   - Try Claude Opus for design decisions
   - Document which works best for game development

5. **Continue Your Documentation**:
   - Your documentation style is excellent
   - Keep doing what you're doing
   - Maybe add a "Communication Patterns" section to track what prompts work best

---

*This is a living document - update it as you learn more about using Cursor effectively.*
