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
cam_in         warp_noise → cam_warp           out_final → Out
   └→ cam_ref ──────┘         └→ trail_mix ─┘
mouse_in → warp_amount ──(expr)──→ cam_warp weight
```

- Rename anything still called `null1` / `noise1`
- Hit Perform Mode and confirm it looks good fullscreen
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
