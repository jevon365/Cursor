# Cursor Quick Reference

**Quick cheat sheet for using Cursor AI effectively**

## Keyboard Shortcuts

| Shortcut | Action | When to Use |
|----------|--------|-------------|
| `Ctrl+L` | Open chat | Ask questions, get explanations |
| `Ctrl+K` | Inline edit | Quick fixes, small changes |
| `Ctrl+I` | Composer mode | Multi-file changes, refactoring |
| `Select + Ctrl+L` | Ask about selection | Get context-specific help |

## Terminology

- **"Cursor"** = The IDE/application
- **"Chat window"** = The AI interface
- **"AI assistant"** or **"agent"** = The model (Claude, GPT-4, etc.)
- **"Auto"** = The routing system (picks best model)

## Best Practices

### ✅ DO
- Select code before asking questions
- Use Composer for multi-file changes
- Ask for explanations, not just code
- Reference specific files/lines in questions
- Save important conversations

### ❌ DON'T
- Just say "fix this" without context
- Use chat for simple edits (use Ctrl+K instead)
- Forget to provide project context
- Skip documenting successful patterns

## Quick Prompts

**Explain code:**
```
Select code → "Explain this like I'm 5"
```

**Debug:**
```
Select error → "What's wrong here?"
```

**Refactor:**
```
Ctrl+I → "Refactor this to [style/pattern]"
```

**Learn:**
```
"Show me 3 ways to do X and explain trade-offs"
```

## Model Selection

- **Auto** (default): Let Cursor choose
- **Claude Sonnet**: Code explanations, understanding
- **GPT-4**: Complex logic, multi-step tasks
- **Claude Opus**: Deep analysis, architecture

## File Locations

**Chat history:**
- `%APPDATA%\Cursor\User\globalStorage\state.vscdb`

**Workspace storage:**
- `%APPDATA%\Cursor\User\workspaceStorage\[hash]\`

---

*See `CURSOR_USAGE_GUIDE.md` for detailed documentation*
