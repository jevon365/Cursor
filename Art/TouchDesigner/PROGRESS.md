# TouchDesigner Progress

Track learning and the interactive art piece here. Check items off as you go (`[ ]` → `[x]`). Add notes under a milestone when something clicks or breaks.

## Learning milestones

### Basics
- [x] Install / open TouchDesigner and save a `.toe`
- [ ] Know TOP / CHOP / SOP / DAT / COMP in one sentence each
- [x] Build a simple chain: source → effect → output (e.g. Movie File In → Level → Null → Out)
- [x] Rename operators clearly; navigate Network Editor without getting lost
- [ ] Toggle Perform Mode and show a fullscreen output (use Window COMP — build-guide §2b)

### Interaction
- [ ] Drive a parameter from a CHOP (slider, noise, or math)
- [ ] React to mouse or keyboard input
- [ ] Use audio or another live signal to change visuals
- [ ] Understand cooking / when networks update

### Structure & reuse
- [ ] Build a small reusable Component and save a `.tox`
- [ ] Load that `.tox` into a project
- [ ] Keep assets in `assets/` and reference them cleanly
- [ ] Make a dated backup before a big rewrite

### Polish
- [ ] Smooth or clamp wild parameter jumps
- [ ] Basic performance check (what is expensive?)
- [ ] Short note in `notes/` explaining the main network path

## Art-project milestones

### Concept
- [x] One-sentence idea for the interactive piece
- [x] What the audience does (input) and what they see/hear (output)
- [x] Mood / visual direction (colors, motion, materials) — keep it simple

Piece: **camera-distort** — laptop webcam stays readable; soft noise warp + light trail. Audience looks / moves in front of the camera (optional mouse pushes warp strength). Mood: gentle, slow, not hard glitch. See `camera-distort/README.md`.

### Prototype
- [x] Folder created for this piece (under `Art/TouchDesigner/`)
- [ ] First working `.toe` with a visible loop
- [ ] At least one real interaction wired in
- [ ] Ugly-but-working version shown to someone (or recorded)

### Iterate
- [ ] Clear named network sections (input / process / output)
- [ ] One reusable `.tox` extracted (optional but useful)
- [ ] Assets organized; no mystery missing files
- [ ] Backup before major visual rewrite

### Share
- [ ] README for the piece: how to open and interact
- [ ] Export or screen recording in `exports/`
- [ ] Short write-up: what you learned + what you'd try next

## Session log (optional)

| Date | What I did | Blocker / next step |
|------|------------|---------------------|
| 2026-10-08 | Scaffolded `camera-distort/` + build guide (cam → noise displace → optional feedback → mouse amount) | Open TD locally; follow `camera-distort/notes/build-guide.md`; save `camera-distort.toe` |
| 2026-10-08 | Built cam_in → cam_ref → cam_warp (displace + warp_noise) → warp_ref → out2 | Add Window COMP `out_window` pointed at `warp_ref` (see build-guide §2b); then optional trail / mouse |
