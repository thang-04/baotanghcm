# Room Three Narrative Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename Room 3 to `PHÒNG 3: TIẾNG NÓI DÂN TỘC` throughout the user-facing system and show the Paris 1919 mission briefing during room transition and on entry.

**Architecture:** Create one plain-data narrative module as the source of truth for the new display name, transition copy, quote, mission text, four steps, and gameplay flow. Reuse the existing `RoomWelcomeModal` for the large entry popup, and extend the existing transition overlay with a special render path for `gallery-ceramics`; keep `gallery-ceramics` unchanged as the internal ID.

**Tech Stack:** Next.js 16.2.9, React 19, TypeScript, existing `RoomWelcomeModal`, existing lobby transition overlay, Vitest.

## Global Constraints

- The display name is exactly `PHÒNG 3: TIẾNG NÓI DÂN TỘC`.
- The internal ID remains `gallery-ceramics`.
- The transition copy is `PARIS · 1919` and `Khôi phục Bản Yêu sách của nhân dân An Nam`.
- The entry quote is `“Một dân tộc muốn cất lên tiếng nói của mình.”`.
- The entry mission is `Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.`.
- The entry popup has exactly four mission steps and the flow `Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo`.
- Do not change room IDs, routes, spawn points, doors, video pillar behavior, exhibits, or existing gameplay state.

---

### Task 1: Create and test the Room 3 narrative source of truth

**Files:**
- Create: `src/lib/roomThreeNarrative.ts`
- Create: `src/lib/roomThreeNarrative.test.ts`

**Interfaces:**
- Produces `ROOM_THREE_DISPLAY_NAME: string`.
- Produces `ROOM_THREE_TRANSITION: { roomName: string; period: string; description: string }`.
- Produces `ROOM_THREE_WELCOME: { quote: string; mission: string; steps: Array<{ title: string; description: string }>; flow: string }`.

- [ ] **Step 1: Write the failing data-contract test**

Create `src/lib/roomThreeNarrative.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  ROOM_THREE_DISPLAY_NAME,
  ROOM_THREE_TRANSITION,
  ROOM_THREE_WELCOME,
} from './roomThreeNarrative';

describe('Room Three narrative', () => {
  it('uses the approved display name and transition copy', () => {
    expect(ROOM_THREE_DISPLAY_NAME).toBe('PHÒNG 3: TIẾNG NÓI DÂN TỘC');
    expect(ROOM_THREE_TRANSITION).toEqual({
      roomName: 'PHÒNG 3: TIẾNG NÓI DÂN TỘC',
      period: 'PARIS · 1919',
      description: 'Khôi phục Bản Yêu sách của nhân dân An Nam',
    });
  });

  it('contains the approved quote, mission and exactly four steps', () => {
    expect(ROOM_THREE_WELCOME.quote).toBe('“Một dân tộc muốn cất lên tiếng nói của mình.”');
    expect(ROOM_THREE_WELCOME.mission).toBe(
      'Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.',
    );
    expect(ROOM_THREE_WELCOME.steps).toHaveLength(4);
    expect(ROOM_THREE_WELCOME.flow).toBe(
      'Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo',
    );
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing module**

Run:

```powershell
npm.cmd test -- src/lib/roomThreeNarrative.test.ts
```

Expected: Vitest fails because `src/lib/roomThreeNarrative.ts` does not exist yet.

- [ ] **Step 3: Implement the exact plain-data constants**

Create `src/lib/roomThreeNarrative.ts`:

```ts
export const ROOM_THREE_DISPLAY_NAME = 'PHÒNG 3: TIẾNG NÓI DÂN TỘC';

export const ROOM_THREE_TRANSITION = {
  roomName: ROOM_THREE_DISPLAY_NAME,
  period: 'PARIS · 1919',
  description: 'Khôi phục Bản Yêu sách của nhân dân An Nam',
} as const;

export const ROOM_THREE_WELCOME = {
  quote: '“Một dân tộc muốn cất lên tiếng nói của mình.”',
  mission: 'Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.',
  steps: [
    { title: 'Vào phòng Paris 1919, đọc bối cảnh.', description: 'Bắt đầu bằng việc đọc kỹ bối cảnh lịch sử và mục tiêu của nhiệm vụ.' },
    { title: 'Xem video về Bản Yêu sách.', description: 'Đến trụ màn hình trung tâm để xem video tư liệu về Bản Yêu sách.' },
    { title: 'Tìm các mảnh văn kiện trong phòng.', description: 'Khám phá các hiện vật và thu thập những mảnh nội dung đã thất lạc.' },
    { title: 'Ghép đúng mục lục/yêu sách để hoàn thành văn kiện.', description: 'Sắp xếp đúng nội dung, đóng dấu gửi tới Hội nghị Versailles và mở khóa trạm tiếp theo.' },
  ],
  flow: 'Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo',
} as const;
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```powershell
npm.cmd test -- src/lib/roomThreeNarrative.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit the tested narrative constants**

```powershell
git add src/lib/roomThreeNarrative.ts src/lib/roomThreeNarrative.test.ts
git commit -m "feat: add room three narrative content"
```

### Task 2: Replace the Room 3 entry popup content

**Files:**
- Modify: `src/components/ui/RoomWelcomeModal.tsx` in `GALLERY_CONFIGS['gallery-ceramics']`

**Interfaces:**
- Consumes `ROOM_THREE_WELCOME` and `ROOM_THREE_DISPLAY_NAME` from `@/lib/roomThreeNarrative`.
- Keeps the existing `GALLERY_CONFIGS` shape and existing step navigation/close behavior.

- [ ] **Step 1: Import the narrative constants without changing popup state logic**

Add:

```tsx
import {
  ROOM_THREE_DISPLAY_NAME,
  ROOM_THREE_WELCOME,
} from '@/lib/roomThreeNarrative';
```

- [ ] **Step 2: Replace only the `gallery-ceramics` configuration**

Set `headerTitle` to `ROOM_THREE_DISPLAY_NAME`, `welcomeTitle` to `PARIS · 1919`, and render the quote and mission in `introText`:

```tsx
headerTitle: ROOM_THREE_DISPLAY_NAME,
welcomeTitle: 'PARIS · 1919',
introText: (
  <>
    <p className="text-xl sm:text-2xl font-serif italic text-slate-800 leading-relaxed">
      {ROOM_THREE_WELCOME.quote}
    </p>
    <p className="mt-3">
      <strong>{ROOM_THREE_WELCOME.mission}</strong>
    </p>
  </>
),
```

Map the four existing icon slots to `ROOM_THREE_WELCOME.steps[0]` through `[3]`, using the current `Search`, `BookOpen`, `Gamepad2`, and `FileCheck` icons. Replace the old summary grid with a labeled flow block that renders `ROOM_THREE_WELCOME.flow`.

- [ ] **Step 3: Run targeted lint and the narrative test**

Run:

```powershell
npx.cmd eslint src/components/ui/RoomWelcomeModal.tsx src/lib/roomThreeNarrative.ts src/lib/roomThreeNarrative.test.ts
npm.cmd test -- src/lib/roomThreeNarrative.test.ts
```

Expected: no targeted lint errors and 2 narrative tests pass.

- [ ] **Step 4: Commit the popup update**

```powershell
git add src/components/ui/RoomWelcomeModal.tsx
git commit -m "feat: show room three Paris 1919 briefing"
```

### Task 3: Update the transition overlay and lobby labels

**Files:**
- Modify: `src/app/lobby/page.tsx`

**Interfaces:**
- Consumes `ROOM_THREE_DISPLAY_NAME` and `ROOM_THREE_TRANSITION`.
- Changes `LobbyPlayer` callback from a name-only transition update to `(roomId: string, fallbackName: string) => void` so the overlay can select Room 3’s rich content while other rooms retain their existing labels.

- [ ] **Step 1: Update Room 3 door labels and lobby metadata**

Import the two narrative constants and replace the user-facing Room 3 values:

```tsx
label: ROOM_THREE_DISPLAY_NAME,
promptVi: `vào ${ROOM_THREE_DISPLAY_NAME}`,
ROOM_GALLERY_MAP['gallery-ceramics'] = {
  id: 'gallery-ceramics',
  name: ROOM_THREE_DISPLAY_NAME,
};
```

Update the Room 3 return prompt to `quay lại ${ROOM_THREE_DISPLAY_NAME}`. Leave all `gallery-ceramics` comparisons and coordinate logic unchanged.

- [ ] **Step 2: Pass the destination room ID into the transition state**

In `LobbyPlayer`’s `KeyE` handler, replace the name-only callback call with:

```tsx
onTransitionRoomChange(door.toRoom, targetRoomName);
```

At `LobbyPage` level, keep the fallback name and add `transitionRoomId` state. Pass:

```tsx
onTransitionRoomChange={(roomId, fallbackName) => {
  setTransitionRoomId(roomId);
  setTransitionRoomName(fallbackName);
}}
```

- [ ] **Step 3: Render the special Room 3 transition content**

Inside the existing `transitionLoading` overlay, render this branch when `transitionRoomId === 'gallery-ceramics'`:

```tsx
<>
  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Đang chuyển phòng</span>
  <p className="text-amber-400 text-xs font-black tracking-[0.28em] mt-2">
    {ROOM_THREE_TRANSITION.roomName}
  </p>
  <p className="text-cyan-300 text-sm font-bold tracking-[0.22em]">
    {ROOM_THREE_TRANSITION.period}
  </p>
  <h2 className="text-xl font-bold text-white tracking-tight mt-2">
    {ROOM_THREE_TRANSITION.description}
  </h2>
</>
```

Render the existing `transitionRoomName` fallback for every other destination room. In the existing inner timeout that calls `setTransitionLoading(false)`, also call `setTransitionRoomId(null)` so a later transition cannot reuse stale content.

- [ ] **Step 4: Run targeted lint and the full narrative test**

Run:

```powershell
npx.cmd eslint src/app/lobby/page.tsx src/components/ui/RoomWelcomeModal.tsx src/lib/roomThreeNarrative.ts src/lib/roomThreeNarrative.test.ts
npm.cmd test
```

Expected: targeted lint passes and all Vitest tests pass.

- [ ] **Step 5: Commit the transition update**

```powershell
git add src/app/lobby/page.tsx
git commit -m "feat: rename room three in lobby transition"
```

### Task 4: Update persistent gallery and other visible Room 3 labels

**Files:**
- Modify: `src/lib/db/gallery-ceramics.json`
- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/CeramicsCollection.tsx`
- Modify: `src/components/ui/RoomTwoDocumentModal.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- All user-facing labels use `ROOM_THREE_DISPLAY_NAME` where the file is TypeScript; JSON uses the exact literal string.
- Internal references such as `gallery-ceramics` remain unchanged.

- [ ] **Step 1: Update the gallery database record**

In `src/lib/db/gallery-ceramics.json`, change the gallery `name` to `PHÒNG 3: TIẾNG NÓI DÂN TỘC` and the gallery `description` to `PARIS · 1919 — Khôi phục Bản Yêu sách của nhân dân An Nam`.

- [ ] **Step 2: Replace visible home-page and collection labels**

In `src/app/page.tsx` and `src/components/ui/CeramicsCollection.tsx`, replace `Phòng 03`, `Phòng Hội Nhập`, `Phòng 03 • Phòng Hội Nhập`, and the equivalent English display label with the approved Vietnamese name for the Vietnamese UI. Keep route links and IDs unchanged.

- [ ] **Step 3: Replace visible cross-room and admin labels**

In `RoomTwoDocumentModal.tsx` and `admin/page.tsx`, replace user-facing references such as `Phòng 03`, `Phòng Hội Nhập`, `Phòng 03 (Đồ gốm sứ)`, and `Phòng 03: Gốm Sứ Hội Nhập` with `PHÒNG 3: TIẾNG NÓI DÂN TỘC`. Do not change comments, IDs, route strings, or state keys unless they are visible text.

- [ ] **Step 4: Search for remaining old display labels**

Run:

```powershell
rg -n -i "Phòng 03|Phòng Hội Nhập|Gốm Sứ Hội Nhập|Integration Room" src/app src/components src/lib/db
```

Expected: no old user-facing label remains; remaining matches must be technical IDs, comments, or intentionally unrelated historical text.

- [ ] **Step 5: Run targeted lint and commit the system-wide label update**

Run:

```powershell
npx.cmd eslint src/app/page.tsx src/app/admin/page.tsx src/components/ui/CeramicsCollection.tsx src/components/ui/RoomTwoDocumentModal.tsx
```

Then commit:

```powershell
git add src/lib/db/gallery-ceramics.json src/app/page.tsx src/app/admin/page.tsx src/components/ui/CeramicsCollection.tsx src/components/ui/RoomTwoDocumentModal.tsx
git commit -m "feat: rename room three across museum UI"
```

### Task 5: Verify the complete narrative flow

**Files:**
- Verify: all files from Tasks 1–4

**Interfaces:**
- Verifies that display copy changes do not affect the `gallery-ceramics` technical ID or room navigation.

- [ ] **Step 1: Run the complete automated checks**

Run:

```powershell
npm.cmd test
npm.cmd run build
```

Expected: all tests pass and Next.js build completes successfully.

- [ ] **Step 2: Run targeted lint over every modified TypeScript file**

Run:

```powershell
npx.cmd eslint src/lib/roomThreeNarrative.ts src/lib/roomThreeNarrative.test.ts src/components/ui/RoomWelcomeModal.tsx src/app/lobby/page.tsx src/app/page.tsx src/app/admin/page.tsx src/components/ui/CeramicsCollection.tsx src/components/ui/RoomTwoDocumentModal.tsx
```

Expected: exit code 0. Existing unrelated full-repository lint errors are not part of this feature and must not be introduced by these files.

- [ ] **Step 3: Verify the running dev server and perform the manual flow**

Run:

```powershell
curl.exe -I --max-time 15 http://localhost:3000/lobby
```

Then manually enter the museum, approach the Room 3 door, press E, verify the transition screen shows the new room name/period/description, wait for teleport completion, verify the large popup shows the quote, mission, four steps, and flow, close it, and confirm movement resumes.

- [ ] **Step 4: Commit any focused verification fix only after a failing test or reproducible UI check**

If a copy or rendering defect is found, add the smallest corresponding assertion to `roomThreeNarrative.test.ts`, observe it fail, fix the source, rerun the complete checks, and commit with:

```powershell
git add src/lib/roomThreeNarrative.ts src/lib/roomThreeNarrative.test.ts src/components/ui/RoomWelcomeModal.tsx src/app/lobby/page.tsx
git commit -m "fix: polish room three narrative flow"
```
