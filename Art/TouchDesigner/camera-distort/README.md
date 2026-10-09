# camera-distort

Laptop webcam feed with small, soft distortions.

**One-sentence idea:** Your camera image stays recognizable, but the picture gently warps and trails so it feels alive.

**Audience does:** Looks at the screen / moves in front of the laptop camera (optional: move the mouse to push the warp strength).

**Audience sees:** Live camera with a subtle noise warp and a light feedback trail.

## Open in TouchDesigner

1. Install / open [TouchDesigner](https://derivative.ca/).
2. Open `camera-distort.toe` in this folder (create it by following `notes/build-guide.md` if it is not there yet).
3. Allow camera access if the OS asks.
4. Press **F1** (or use the dialog) for **Perform Mode** to show fullscreen output.

## Network path (high level)

```
INPUT     Video Device In (cam_in) → Null (cam_ref)
PROCESS   Noise → Displace (subtle warp) → Feedback mix (soft trail)
OUTPUT    Null (warp_ref / out_final) → Window COMP (out_window)
```

Use a **Window COMP** for a real on-screen window. An **Out** TOP alone does not open one.

Details and exact steps: [`notes/build-guide.md`](notes/build-guide.md).

## Folders

| Folder | Use |
|--------|-----|
| `notes/` | Build steps and short learnings |
| `assets/` | Small intentional media (keep huge files out of git) |
| `tox/` | Reusable components later |
| `exports/` | Screen recordings / shares (large video usually gitignored) |

## Status

Scaffold + build guide ready. Save your first working `.toe` here as `camera-distort.toe` after you complete the guide.
