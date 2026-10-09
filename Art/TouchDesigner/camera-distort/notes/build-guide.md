# Build guide — camera + small distortions

Goal: live laptop camera → slight warp → soft trail → fullscreen out.

Keep placeholders tiny. Prefer **additive edits**: build beside the old chain, then swap wires. Backup the `.toe` before a big rewrite.

---

## 0. Save the project

1. In TouchDesigner: **File → Save As…**
2. Save into this folder as: `camera-distort.toe`
3. Confirm the file sits next to this `notes/` folder.

---

## 1. Camera in (input)

| Step | What to do |
|------|------------|
| 1 | Tab in empty space → create **Video Device In** TOP. Rename to `cam_in`. |
| 2 | In its parameters, pick your **laptop webcam** (Device). Resolution can stay default. |
| 3 | Wire `cam_in` → new **Null** TOP named `cam_ref`. |
| 4 | Wire `cam_ref` → **Out** TOP (or use the existing `/project1/out1` if that is already your viewer out). |

You should see yourself (or your room) in the viewer. If black:

- Check OS camera permission for TouchDesigner
- Try another Device index on `cam_in`
- Close other apps that lock the webcam (Zoom, browser tabs, etc.)

**Checkpoint:** camera image visible. Toggle **Perform Mode** once so you know the show path works.

---

## 2. Small warp (process)

We bend the image a little with noise. Not a heavy glitch — just a soft shimmer.

| Step | What to do |
|------|------------|
| 1 | Create **Noise** TOP named `warp_noise`. |
| 2 | On `warp_noise`: set **Type** to something smooth (e.g. sparse / hermite — whatever looks soft). Turn **Period** up so it moves slowly. Keep contrast gentle. |
| 3 | Create **Displace** TOP named `cam_warp`. |
| 4 | Wire `cam_ref` into Displace **first input** (source image). |
| 5 | Wire `warp_noise` into Displace **second input** (displacement map). |
| 6 | On `cam_warp`, turn **Displace Weight** (or equivalent) **way down** — start near zero and nudge up until you see a small wiggle, not a melt. |
| 7 | Wire `cam_warp` → Null named `warp_ref` → your Out (temporarily replace the direct `cam_ref` → Out wire). |

**Why:** Noise is a moving grayscale map. Displace uses that map to push pixels sideways. Low weight = “small distortions.”

---

## 2b. Show it in a window

`out2` (an **Out** TOP) is for exposing a texture out of a component — it does **not** open a desktop window. For a real window, use a **Window COMP**.

Wiring a TOP *into* the Window COMP also does **not** choose what it shows. You set **Window Operator** on the parameter page.

| Step | What to do |
|------|------------|
| 1 | Tab → create **Window** COMP (e.g. `window1` or rename to `out_window`). |
| 2 | Select it → **Window** page. |
| 3 | Set **Window Operator** (`winop`) to `warp_ref` (or `/project1/warp_ref`). This is usually near the **top** of the Window page (above Justify…). |
| 4 | Optional size: **Opening Size** → Custom, then Width/Height; or leave Automatic from Panel/TOP. |
| 5 | Open the **Open/Close** parameter page (tab next to Window / Common — use the small tab arrows if you don’t see it). |
| 6 | Click **Open as Separate Window** (pulse button). A floating window should appear. |
| 7 | For fullscreen show later: **Open as Perform Window**, or press **F1**. You can also **Dialogs → Window Placement** and set this COMP as the Perform window. |

**If you don’t see “Open” on the Window tab:** that’s normal in current TD. Open lives on the **Open/Close** page, not under Justify / Borders / Draw Window.

**Other ways to open the same window:**

- Right-click the Window COMP → **Open as Separate Window**
- Press **F1** (Perform Mode) after setting it as the Perform window
- Textport one-liner: `op('window1').par.winopen.pulse()` (use your COMP’s name)

**Quick check:** if the window is black, Window Operator path is wrong or the TOP isn’t cooking — click `warp_ref` and confirm it still shows the warped feed.

**Why:** Window COMP = “put this operator on screen as a real OS window.” Out TOP = “output plug inside the network.”

---

## 3. Soft trail (optional second distortion)

Feedback is a **loop**: each frame keeps a faded copy of the last frame, then mixes it with the live camera. The Feedback TOP does **not** just sit in a line — it needs a **Target TOP** pointed at the end of that loop.

### Picture of the loop

```
warp_ref ──┬──► trail_fb ──► trail_dim ──► trail_comp ──► trail_mix
           │        ▲                           │              │
           │        └──── Target TOP = trail_mix ┴──────────────┘
           └────────────────────────────────────┘
                 (live also into trail_comp)
```

- `trail_fb` = Feedback TOP (looks “back” at `trail_mix`)
- `trail_dim` = Level TOP (fades the ghost so it dies out)
- `trail_comp` = Composite TOP (ghost + live)
- `trail_mix` = Null TOP (end of loop + what you show)

### Build it (clean order)

| Step | What to do |
|------|------------|
| 1 | From `warp_ref`, create **Feedback** TOP → rename `trail_fb`. Wire: `warp_ref` → `trail_fb`. |
| 2 | From `trail_fb`, create **Level** TOP → rename `trail_dim`. Wire: `trail_fb` → `trail_dim`. |
| 3 | On `trail_dim`, lower **Opacity** or **Brightness** a bit (try ~0.85–0.95). Lower = shorter trail; higher = longer smear. |
| 4 | Create **Composite** TOP → rename `trail_comp`. |
| 5 | Wire **first input** of `trail_comp` ← `trail_dim` (the ghost). |
| 6 | Add the **live** layer (pick **one** method below). Same `warp_ref` feeds Feedback *and* this mix. |
| 7 | On `trail_comp`, set **Operation** to **Over** or **Add** — not Multiply. If it’s too strong, lower the ghost via `trail_dim`. |

**How to get 2 inputs on Composite** (this trips people up):

Composite is not limited to one cable. Use either:

**A — Second wire (usual):**
1. Clear the **TOPs** text field on `trail_comp` (delete junk like `trail_db` — that name doesn’t exist and causes the red X).
2. From `warp_ref`’s **right-side output**, drag a new wire onto `trail_comp`’s body (or left side) and release.
3. In the **Connected Input OPs** table you should see two rows: `trail_dim` (0) and `warp_ref` (1).

**B — Name in the TOPs field (no second wire):**
1. Keep the wire from `trail_dim`.
2. In **TOPs**, type exactly: `warp_ref` (not `trail_db`).
3. Operation = **Over** or **Add**.

Don’t mix a bad TOPs name with wires — empty TOPs + two wires, *or* one wire + valid TOPs name.
| 8 | From `trail_comp`, create **Null** → rename `trail_mix`. Wire: `trail_comp` → `trail_mix`. |
| 9 | Select `trail_fb` → Feedback page → **Target TOP** = `trail_mix` (or `/project1/trail_mix`). |
| 10 | On `trail_fb`, **Reset** should be **off (0)** for the trail to run. Reset **on (1)** = pass-through only (no trail). Pulse **Reset Pulse** if the image looks stuck/weird. |
| 11 | Point your Window’s **Window Operator** at `trail_mix` (not `warp_ref`) so the floating window shows the trail. |

### If `trail_mix` has a red X

1. Middle-click the red X (or hover) and read the error text.
2. Most common fixes:
   - `trail_fb` **Target TOP** is empty, points at the wrong node, or points at `trail_fb` itself → set it to `trail_mix`
   - `trail_comp` only has one input wired → needs **both** `trail_dim` and `warp_ref`
   - Cook loop / bad target → temporarily clear Target TOP, confirm `warp_ref` → `trail_fb` → `trail_dim` → `trail_comp` → `trail_mix` all show an image, then set Target to `trail_mix` again
3. You can delete `trail_fb` / `trail_dim` / `trail_comp` / `trail_mix` and rebuild with the table above (additive: keep `warp_ref` working the whole time).

### What you should see

Move in front of the camera: a soft ghost should linger behind you, then fade. If it’s a muddy smear, turn `trail_dim` opacity down. If you see nothing extra, check Reset is off and Target TOP = `trail_mix`.

**Why:** Feedback reads the Target TOP’s previous frame. Level fades that memory. Composite glues memory + live together. The Null at the end is the “memory address” Feedback keeps reading.

If this still feels cursed: skip trails for now — warp + window already counts as a working piece. Move on to §4 (mouse).

---

## 4. One real interaction (mouse)

| Step | What to do |
|------|------------|
| 1 | Create **Mouse In** CHOP named `mouse_in`. |
| 2 | Create **Math** CHOP named `warp_amount` to remap mouse X (or Y) into a small range, e.g. `0.01` → `0.08` (tune to taste). |
| 3 | On `cam_warp`’s Displace Weight parameter, use an expression that reads `warp_amount` (e.g. `op('warp_amount')['chan1']` — match your channel name). |
| 4 | Move the mouse: warp should get a bit stronger / softer. |

**Why:** CHOPs are signals. Driving a TOP parameter from a CHOP is the core “interaction” habit in TD.

---

## 5. Clean names + Perform Mode

Suggested layout (left → right):

```
INPUT          PROCESS                         OUTPUT
cam_in         warp_noise → cam_warp → warp_ref ──→ out_window (Window COMP)
   └→ cam_ref ──────┘         └→ trail_mix ─┘
mouse_in → warp_amount ──(expr)──→ cam_warp weight
```

- Rename anything still called `null1` / `noise1` (your unused green Noise CHOP can be deleted)
- Open `out_window`, then try Perform Mode (**F1**) for fullscreen
- If the image cooks slowly, lower camera resolution or noise resolution before adding more effects

---

## 6. After it works

1. Check off matching boxes in `Art/TouchDesigner/PROGRESS.md`
2. Add a session-log row (what worked / what’s next)
3. Optional: short screen recording into `exports/` (usually gitignored if `.mp4`)
4. Optional later: extract the warp block into a `.tox` under `tox/`

---

## Mood / visual direction (keep simple)

- Live camera stays readable
- Soft, slow motion — not strobe / hard glitch
- Neutral grade for now (no heavy color grading until the loop feels good)
