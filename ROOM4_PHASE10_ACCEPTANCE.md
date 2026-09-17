# Room 4 — Phase 10 acceptance and visitor walkthrough

## Outcome

Room 4 is ready for an observed 5–7 minute walkthrough. The approved journey remains unchanged:

```text
Room 3 → Journey Card → S1 → S2 → S3 → Moscow–Guangzhou transition
       → S4 → S5 → S6 → S7 → S8 → Room 5
```

Phase 10 makes no historical, spatial, or circulation change. It resolves two wayfinding issues found during the production walkthrough:

- Temporary wayfinding notices now sit below the persistent Journey Card and finale panel at every viewport size.
- The entry HUD now sends visitors to the Journey Card desk on the **right**, matching the opening camera view and first interactable.
- Before the card is collected, station labels stay out of the entry view so the start cue, floor spine, and target desk have a single unambiguous hierarchy.

## Facilitated test protocol

Run the protocol with four people who have not seen the room. Do not explain the route, name the next station, or point at an object. An observer may only use the neutral prompts in the final column.

| Time | Participant task | Observer checks | Neutral prompt, only if stalled for 20 seconds |
| --- | --- | --- | --- |
| 0:00–0:45 | Enter from Room 3 and begin. | Finds the Journey Card desk, card, and first floor stop. | “What do you think is the first object to use?” |
| 0:45–2:30 | Complete S1, S2, and S3. | At each station, reads the floor ring, central artifact, and Journey Card progress; moves in station order. | “What is the room showing as next?” |
| 2:30–3:10 | Leave S3 and continue. | Finds the cold-to-warm transition and identifies Guangzhou as the next destination without it being named by the observer. | “What changed in the space after the ticket?” |
| 3:10–5:30 | Continue through S4–S8. | Uses the single station action, notices the after-state, and sees the card update. | “What does the current object ask you to do?” |
| 5:30–6:00 | Complete S8 and leave toward Room 5. | Sees the converged seals, exit wording, and open route to Room 5. | “What is ready to return home?” |
| 6:00–7:00 | Explain the whole room in one sentence. | States the causal chain, not a list of dates. | “How did the Soviet stage become activity returning to Vietnam?” |

## Observation sheet

Record the first occurrence only; do not count clicks or assign a score.

| Participant | Completed Card + S1–S3 in order | Found transition unprompted | Completed S8 | Said “international learning → organisation/press/cadres → network homeward” (or equivalent) | Stop / wrong turn / unclear action | Blocking issue |
| --- | --- | --- | --- | --- | --- |
| P1 |  |  |  |  |  |  |
| P2 |  |  |  |  |  |  |
| P3 |  |  |  |  |  |  |
| P4 |  |  |  |  |  |  |

Pass the people-facing acceptance when at least three of four participants follow the core sequence without skipping a station and independently explain the Soviet Union → Guangzhou → Vietnam relationship. Treat a collision trap, an overlay that cannot close with **Escape** or **×**, lost progress after reload, or an unavailable next station as a blocking failure.

## Three-signal check at every station

Before adding explanatory copy, verify these existing signals in order:

1. The floor ring and active beacon identify where to stand.
2. The central artifact identifies what the station is about and what has changed after interaction.
3. The Journey Card shows station count, seals, and the next station.

The current implementation keeps the active guide distinct from the completed green ring; historical artifact colours remain cold/warm rather than being recoloured green.

## Demo paths

### A — Unassisted first section

1. Open Room 4 with a fresh nickname and password `sjkc21jdx2k23`.
2. Follow the entry cue to the Journey Card desk on the right, then complete S1, S2, and S3 in order.
3. Confirm the card advances and the S3 completion reveals the Moscow → Guangzhou transition label.

### B — Story comprehension and finale

1. Continue through S4–S8 in order.
2. Complete the four Station 8 routes.
3. Confirm that the five core seals converge, the Return Map retains its completed state, and the exit reads: **“Hành trang đã sẵn sàng — Con đường về Tổ quốc.”**
4. Ask the participant for the one-sentence summary recorded above.

### C — Resilience and responsiveness

1. While a station overlay is open, press **Escape**; reopen it and use **×**. Confirm both restore camera/movement control.
2. After at least one completed station, reload the page with the same nickname. Confirm its completed artifact state and Journey Card progress restore.
3. Set graphics to **Siêu Thấp / Ultra Low** and repeat the S3-to-transition and S8 checks. The route, artifact, and card must remain readable even when motion is removed.
4. At a small laptop viewport (1024 × 640), trigger a progression notice. Confirm it is below the persistent card rather than obscuring it.

## Technical verification completed

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false` | Pass |
| Focused ESLint for Room Four scene, overlay, journey data, and layout | Pass |
| `npm run build` | Pass — Next.js 16.2.9 production build |
| `git diff --check` for Room Four files | Pass (line-ending notice only) |
| Production entry at 1024 × 640 / Ultra Low | Pass — floor spine, active object, and Journey Card cue remain readable |
| Movement lock while Room Four overlay is open | Verified in `PlayerCharacter` and lobby player controls |
| Escape and close button | Pass in the production walkthrough |
| Per-nickname save/restore | Pass after reload and re-entry with the same nickname under `roomFourProgress:<nickname>` |
| Shared room bounds/colliders | Verified through `roomFourLayout` in both standalone and lobby movement paths |

The participant tests above are intentionally left for real observers: their 3/4 result must be measured rather than inferred from implementation or automated checks.
