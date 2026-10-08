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

| Step | What to do |
|------|------------|
| 1 | Create **Feedback** TOP named `trail_fb`. |
| 2 | Wire `warp_ref` into the feedback chain per TD’s Feedback pattern (Target / output loop — follow the operator’s help if unsure). |
| 3 | Mix the feedback with the live warp using **Composite** or **Add** / **Over** at **low** opacity / gain so you get a short ghost trail, not a smear storm. Name the mix `trail_mix`. |
| 4 | Null that as `out_final` → Out. |

If Feedback feels fiddly on day one: skip this section. Warp alone already counts as a working piece.

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
