# Room Three Video Pillar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a four-sided video pillar at the center of Room 3 that auto-plays the supplied local MP4 when the player enters a 3-meter radius, with a fallback “Bật tiếng” control when audible autoplay is blocked.

**Architecture:** Keep the feature self-contained in a reusable `VideoPillar` React Three Fiber component mounted by `RoomThree`. The component creates one browser video element and one `THREE.VideoTexture`, maps the texture to four screen planes, detects the world-space position of `lobby-player`, and owns the muted/autoplay fallback control through drei `Html`. A small pure geometry helper will make the enter/leave boundary behavior testable without mounting WebGL.

**Tech Stack:** Next.js 16.2.9, React 19, React Three Fiber, Three.js `VideoTexture`, drei `Html`, TypeScript, Vitest.

## Global Constraints

- The video source is `1786471815039_191732243237186469_g6970148838092397238.mp4` and must be copied into `public/videos/room-three-pillar.mp4`.
- The pillar is mounted at local `[0, 0, 0]` inside `RoomThree`; `DynamicRoom` supplies the existing Room 3 world offset.
- The activation radius is exactly 3 meters in XZ distance.
- Entering starts playback from time 0; leaving pauses and resets to time 0; re-entering starts from the beginning.
- Audible autoplay is attempted first. A rejected `play()` call falls back to muted playback and shows **Bật tiếng**.
- The video is rendered inline on the 3D TV screens; do not add a full-screen modal or E-key interaction.
- Do not modify galleries, exhibits, quests, multiplayer behavior, or other rooms.

---

### Task 1: Add the test runner and write the failing activation-boundary tests

**Files:**
- Modify: `package.json` (add `test` script and Vitest dev dependency)
- Create: `src/lib/videoPillarZone.test.ts`

**Interfaces:**
- The tests define the required public API for `src/lib/videoPillarZone.ts`: `isInsideVideoPillarZone(...)` and `getVideoPillarTransition(...)`.

- [ ] **Step 1: Install the test runner without changing runtime dependencies**

Run:

```powershell
npm.cmd install --save-dev vitest
```

Then add this script to `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write one test per boundary behavior before production code**

Create `src/lib/videoPillarZone.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getVideoPillarTransition,
  isInsideVideoPillarZone,
} from './videoPillarZone';

describe('video pillar activation zone', () => {
  it('treats a player inside the 3-meter radius as active', () => {
    expect(isInsideVideoPillarZone(2.9, 0, 0, 0, 3)).toBe(true);
  });

  it('treats a player on or outside the radius boundary as inactive', () => {
    expect(isInsideVideoPillarZone(3, 0, 0, 0, 3)).toBe(false);
    expect(isInsideVideoPillarZone(4, 0, 0, 0, 3)).toBe(false);
  });

  it('reports only an outside-to-inside transition as enter', () => {
    expect(getVideoPillarTransition(false, true)).toBe('enter');
    expect(getVideoPillarTransition(true, true)).toBe('none');
  });

  it('reports only an inside-to-outside transition as leave', () => {
    expect(getVideoPillarTransition(true, false)).toBe('leave');
    expect(getVideoPillarTransition(false, false)).toBe('none');
  });
});
```

- [ ] **Step 3: Run the new test and verify the failure is for the missing helper**

Run:

```powershell
npm.cmd test -- src/lib/videoPillarZone.test.ts
```

Expected: Vitest fails because `./videoPillarZone` does not exist yet, not because of a test syntax or configuration error.

- [ ] **Step 4: Commit the red test setup**

```powershell
git add package.json package-lock.json src/lib/videoPillarZone.test.ts
git commit -m "test: define room three video pillar activation"
```

### Task 2: Implement and verify the pure activation helper

**Files:**
- Create: `src/lib/videoPillarZone.ts`
- Test: `src/lib/videoPillarZone.test.ts`

**Interfaces:**
- Produces `isInsideVideoPillarZone(playerX: number, playerZ: number, centerX: number, centerZ: number, radius: number): boolean`.
- Produces `getVideoPillarTransition(wasInside: boolean, isInside: boolean): 'enter' | 'leave' | 'none'`.

- [ ] **Step 1: Implement the minimal distance and transition functions**

Create `src/lib/videoPillarZone.ts`:

```ts
export type VideoPillarTransition = 'enter' | 'leave' | 'none';

export function isInsideVideoPillarZone(
  playerX: number,
  playerZ: number,
  centerX: number,
  centerZ: number,
  radius: number,
): boolean {
  const dx = playerX - centerX;
  const dz = playerZ - centerZ;
  return dx * dx + dz * dz < radius * radius;
}

export function getVideoPillarTransition(
  wasInside: boolean,
  isInside: boolean,
): VideoPillarTransition {
  if (!wasInside && isInside) return 'enter';
  if (wasInside && !isInside) return 'leave';
  return 'none';
}
```

- [ ] **Step 2: Run the focused test and verify green**

Run:

```powershell
npm.cmd test -- src/lib/videoPillarZone.test.ts
```

Expected: all four tests pass.

- [ ] **Step 3: Commit the tested helper**

```powershell
git add src/lib/videoPillarZone.ts src/lib/videoPillarZone.test.ts
git commit -m "feat: add video pillar activation zone helper"
```

### Task 3: Add the local video asset

**Files:**
- Create: `public/videos/room-three-pillar.mp4`

**Interfaces:**
- Produces the browser URL `/videos/room-three-pillar.mp4` consumed by `VideoPillar`.

- [ ] **Step 1: Create the target folder and copy the supplied MP4**

Run from the repository root:

```powershell
New-Item -ItemType Directory -Force 'public/videos' | Out-Null
Copy-Item -LiteralPath 'D:\Game HCM\1786471815039_191732243237186469_g6970148838092397238.mp4' -Destination 'public/videos/room-three-pillar.mp4' -Force
```

- [ ] **Step 2: Verify the asset is present and non-empty**

Run:

```powershell
$video = Get-Item -LiteralPath 'public/videos/room-three-pillar.mp4'
if ($video.Length -le 0) { throw 'Video asset is empty' }
$video | Select-Object FullName, Length
```

Expected: the file exists under `public/videos` and is approximately 10.9 MB.

- [ ] **Step 3: Commit the asset**

```powershell
git add public/videos/room-three-pillar.mp4
git commit -m "feat: add room three pillar video"
```

### Task 4: Build the four-sided VideoPillar component and mount it in RoomThree

**Files:**
- Create: `src/components/3d/VideoPillar.tsx`
- Modify: `src/components/3d/rooms/RoomThree.tsx` (import and mount the component)

**Interfaces:**
- `VideoPillar` accepts optional `activationRadius?: number`, defaulting to `3`.
- `VideoPillar` owns its browser video element, `VideoTexture`, enter/leave state, autoplay fallback, and `Html` mute button.
- `RoomThree` renders `<VideoPillar />` once at the local room origin.

- [ ] **Step 1: Create the component shell and media lifecycle**

Implement these concrete behaviors in `VideoPillar.tsx`:

```tsx
const VIDEO_URL = '/videos/room-three-pillar.mp4';
const DEFAULT_ACTIVATION_RADIUS = 3;

export interface VideoPillarProps {
  activationRadius?: number;
}
```

Inside the component, create the video element in `useEffect` with `loop`, `playsInline`, `preload = 'auto'`, and `crossOrigin = 'anonymous'`. Create one `THREE.VideoTexture`, set `colorSpace = THREE.SRGBColorSpace`, and dispose the texture on cleanup. Do not access `document` during render so the component remains SSR-safe.

- [ ] **Step 2: Add the 3D pillar and four synchronized screens**

Render one group at local origin containing:

```tsx
<cylinderGeometry args={[0.85, 1.0, 0.28, 32]} />
<cylinderGeometry args={[0.58, 0.7, 3.25, 24]} />
<boxGeometry args={[2.9, 1.9, 0.12]} />
```

Place four TV meshes around the pillar at Y `2.35`, rotated around Y by `0`, `Math.PI / 2`, `Math.PI`, and `Math.PI * 1.5`. Use the same `VideoTexture` for each screen, with a dark frame and a low-intensity emissive border so every viewing direction shows the same video.

- [ ] **Step 3: Add player-distance transitions using the tested helper**

In `useFrame`, find `state.scene.getObjectByName('lobby-player')`, calculate the pillar center in world coordinates with the component group’s `getWorldPosition`, and pass the player and center XZ coordinates to `isInsideVideoPillarZone`. Track the previous boolean in a ref and use `getVideoPillarTransition` so playback is only restarted on `enter` and reset on `leave`.

On enter:

```ts
video.currentTime = 0;
video.muted = false;
video.play().catch(async () => {
  video.muted = true;
  setNeedsUnmute(true);
  await video.play().catch(() => undefined);
});
```

On leave, call `pause()`, set `currentTime = 0`, and clear `needsUnmute`.

- [ ] **Step 4: Add the muted-autoplay fallback button**

When `needsUnmute` is true, render a drei `Html` button above the pillar with the text `Bật tiếng` in Vietnamese and `Unmute` in English based on `useMuseum().language`. The click handler sets `video.muted = false`, attempts `video.play()`, and clears the warning only after playback succeeds. If it rejects again, keep the button visible.

- [ ] **Step 5: Mount the component in RoomThree**

Add `import { VideoPillar } from '../VideoPillar';` and render `<VideoPillar />` inside the existing `BaseRoom` children at the room origin. Do not move the existing spotlights, rails, rope barriers, or exhibit layout.

- [ ] **Step 6: Run lint and TypeScript/build checks for the component**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: both commands complete without TypeScript, React Three Fiber, or Next.js errors.

- [ ] **Step 7: Commit the component integration**

```powershell
git add src/components/3d/VideoPillar.tsx src/components/3d/rooms/RoomThree.tsx
git commit -m "feat: add four-sided room three video pillar"
```

### Task 5: Run end-to-end verification in the dev server

**Files:**
- Verify only: `public/videos/room-three-pillar.mp4`, `src/components/3d/VideoPillar.tsx`, `src/components/3d/rooms/RoomThree.tsx`

**Interfaces:**
- Verifies the complete user-visible behavior at `http://localhost:3000`.

- [ ] **Step 1: Run the complete automated checks**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: Vitest passes, lint has no errors, and the production build completes.

- [ ] **Step 2: Confirm the local asset is served by Next.js**

Run:

```powershell
curl.exe -I --max-time 10 http://localhost:3000/videos/room-three-pillar.mp4
```

Expected: the response is successful and has a video content type or a successful static-file response.

- [ ] **Step 3: Manually verify the Room 3 flow**

Open `http://localhost:3000`, enter the museum, enter Room 3, and walk to the center. Verify that all four screens show the same video, the video starts from the beginning on entry, pauses/resets after leaving, and restarts on re-entry. If autoplay audio is blocked, verify the **Bật tiếng** button appears and enables audio after clicking.

- [ ] **Step 4: Commit any verification-only fix and report results**

If verification exposes a real implementation issue, write a focused failing test first, fix the smallest production behavior, rerun the complete checks, and commit with:

```powershell
git add src/components/3d/VideoPillar.tsx src/lib/videoPillarZone.ts src/lib/videoPillarZone.test.ts
git commit -m "fix: stabilize room three video playback"
```
