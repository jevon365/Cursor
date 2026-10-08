# Start here — TouchDesigner

Quick onboarding for future Cursor/cloud agents (and Jevon). Read this first, then the rules and progress files.

## What this folder is for

Interactive TouchDesigner art + learning. Build small real-time pieces (input → change → output), learn operators as you go, and keep the work reopenable later.

## Where context lives

| File | Why it matters |
|------|----------------|
| `Art/.cursorrules` | Sibling Art-layer rules (naming, backups, structure) |
| `Art/TouchDesigner/.cursorrules` | TD-specific rules (operators, networks, Perform Mode) |
| `Art/TouchDesigner/PROGRESS.md` | Learning + art-piece checklists and session log |
| `Art/TouchDesigner/README.md` | Folder overview and how to use the tracking docs |

Root `.cursorrules` still applies for tone (ELI5, concise, practical).

## How to work here

1. **Read the rules first** — `Art/.cursorrules`, then this folder’s `.cursorrules`.
2. **Update `PROGRESS.md`** — check off what actually stuck or works; use the session log for “what next.”
3. **Backup before destructive `.toe` edits** — never overwrite a project without a dated backup; prefer additive edits (build beside, then swap wires).
4. **Keep pieces organized** — one piece per subfolder when it grows; prefer main `.toe`, plus `tox/`, `assets/`, `notes/`, `exports/` as needed. Don’t commit crash dumps or huge unused media.

## Current scaffold state

First piece folder exists: **`camera-distort/`** (README + `notes/build-guide.md`). No `.toe` committed yet — you create that locally in TouchDesigner.

Also here: `.cursorrules`, `.gitignore`, `PROGRESS.md`, `README.md`, and this `START_HERE.md`.

## Suggested first steps

1. Install / open TouchDesigner (Derivative).
2. Follow [`camera-distort/notes/build-guide.md`](camera-distort/notes/build-guide.md): webcam → small warp → optional trail → Out; save as `camera-distort/camera-distort.toe`.
3. Wire mouse (or a slider) to displace amount; toggle Perform Mode once.
4. Check off the matching items in `PROGRESS.md` and add a session-log row.
5. Keep assets / notes / exports inside `camera-distort/` as the piece grows.
