# Design QA — Selected mobile portfolio guide

## Source visual truth

- Approved mobile direction: `/Users/mateoespinosa/.codex/generated_images/019fe208-fe38-7ca0-a45b-9153cd2cf5a3/exec-6daf3a8b-d4a0-4551-93a7-08f20486a4b7.png`
- Source dimensions: 853 × 1844 px.
- Source state: expanded mobile conversation answering “¿Qué productos financieros ha diseñado Mateo?” with an editorial project list and fixed voice/send composer.
- Product constraints retained: vintage project covers in chat, real case-study media inside each project, a subtle animated Three.js AI signal in the initial prompt, and response layouts selected by question intent.

## Implementation evidence

- Mobile implementation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-mobile-evidence.png`
- Normalized side-by-side comparison, source left and implementation right: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-mobile-comparison.png`
- Desktop regression state: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-desktop-regression.png`
- Local URL: `http://localhost:4173/#chat`
- Mobile viewport: 393 × 852 CSS px at 1×. The source was normalized to the same viewport in the comparison.
- Desktop regression viewport: 1280 × 720 CSS px.

## Full-view and focused comparison

- The implementation matches the approved hierarchy: compact back/header row, right-aligned question capsule, assistant activity line, two-line editorial headline, three evidence rows, contextual follow-up and fixed composer.
- Spacing and vertical landmarks were checked at full resolution. The activity line begins at 173 px, the project list at 282 px and the composer at 763 px in the 852 px viewport; the transcript fits without meaningful auto-scroll (`scrollTop` ≤ 0.5 px from fractional layout rounding).
- Project covers use the existing MiBanco, Credicorp Capital and Dando assets with grayscale/sepia treatment. The implementation intentionally shows documented portfolio metrics (`14 → 4:30`, `US$1.2B`, `+158%`) instead of the generated reference's illustrative values.
- The composer keeps only voice and send, with a pronounced orange-to-gold border, warm shadow and 44 × 44 px touch targets. The back control also exposes a 44 × 44 px target while preserving the compact visual alignment.
- Desktop keeps the existing three-card carousel, contextual rail and expanded-case behavior; the mobile evidence list and back control remain hidden there.

## Primary interactions and adaptive behavior

- Selecting “Productos financieros” opens the focused full-screen mobile conversation and renders three project evidence actions.
- Opening MiBanco from the evidence list launches the existing accessible project dialog with real case content.
- Closing the expanded chat only changes presentation state; messages and evidence remain mounted in the canvas.
- Metrics, process, role, profile and project questions continue to use their distinct existing presentation contracts; the new evidence-list treatment is scoped to the mobile multi-project carousel response.
- The initial state keeps the small Three.js orb and the same voice/send composer.

## Iteration history

1. Added the mobile-only evidence-list presentation while preserving the desktop carousel and all other adaptive response formats.
2. Hid site navigation, HUD and sibling canvas sections only while the mobile conversation is expanded, removing page-content bleed.
3. Matched the approved 393 × 852 composition, then corrected the header scale, headline wrap, project-image proportions and transcript overflow.
4. Strengthened the composer gradient/shadow and expanded the back, voice and send hit areas to 44 px.
5. Rechecked the complete mobile state against the normalized source and verified the desktop regression state.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3 — intentional data fidelity] Credicorp Capital and Dando use the real portfolio covers, summaries and documented metrics rather than the generated reference's illustrative building/phone photography and placeholder values.
- [P3 — intentional responsive specialization] The approved evidence rows are mobile-only; desktop retains the previously approved card carousel because it better uses the available canvas width.

## Validation

- 30 automated tests passed.
- `npm run lint` passed.
- `npm run build` passed. The existing Three.js chunk-size advisory remains non-blocking.
- Browser checks confirmed the 393 × 852 layout, 44 px primary touch targets, project opening and desktop carousel visibility.

## Final result

passed

---

# Design QA — Persistent editorial AI canvas

## Source visual truth

- Approved initial state: `/Users/mateoespinosa/.codex/generated_images/019fe208-fe38-7ca0-a45b-9153cd2cf5a3/exec-a8cd6d70-9d46-4548-8ee5-4cde0b0675d9.png`
- Approved conversation state: `/Users/mateoespinosa/.codex/generated_images/019fe208-fe38-7ca0-a45b-9153cd2cf5a3/exec-acb7b569-4784-45fc-a363-448976feb59c.png`
- Source dimensions: 1536 × 1024 px for both desktop states.
- Final user constraints: the Three.js figure must remain small and subtle, use smooth motion, and the input container must expose only voice and send controls.

## Implementation evidence

- Desktop initial state: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-initial-threejs.png`
- Desktop persistent conversation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-conversation-persistent.png`
- Initial side-by-side comparison: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-initial-comparison.png`
- Conversation side-by-side comparison: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-conversation-comparison.png`
- Mobile initial state: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-mobile-threejs.png`
- Mobile conversation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-mobile-conversation.png`
- Local URL: `http://localhost:4173/`
- Desktop viewport: 1536 × 1024 CSS px. Mobile viewport: 390 × 844 CSS px.

## Full-view comparison

- The implementation matches the approved editorial split: contextual rail, quiet header, generous warm-paper canvas, centered AI prompt and a wide low-contrast composer.
- The initial headline now remains on one line at the reference desktop width and wraps deliberately on mobile.
- The Three.js object is intentionally more restrained than the early reference: six translucent amber lobes surround a dark core at 104 px desktop and 83 px mobile. It reacts to pointer movement and transitions between idle, typing, listening and thinking states without becoming the primary visual element.
- The conversation state keeps the user question, serif assistant lead, three vintage project cards, metrics, case actions, pagination and contextual follow-ups in the embedded canvas.
- Project cards are numbered within the response (`01–03`) to match the approved conversation composition.

## Behavior and accessibility checks

- Sending the first question changes the same embedded surface from `starter` to `conversation`; there is no replacement hero and no floating launcher.
- Expanding the chat only changes the positioning of that same surface. Closing or pressing Escape returns it to the canvas with the same message state.
- The composer contains exactly two native buttons: `Iniciar dictado por voz` and `Enviar mensaje`.
- Dictation uses the browser Speech Recognition API when available and presents a non-blocking fallback message when microphone access or recognition is unavailable.
- The orb animation pauses offscreen or while the document is hidden, caps device-pixel ratio, disposes Three.js resources, and renders a static state for `prefers-reduced-motion`.
- Mobile keeps one full project card plus a preview of the next. The document width remained 390 px at a 390 px viewport; horizontal overflow is isolated to the intended carousel and suggestion row.
- Form labels, live status text, transcript semantics, button labels, focus styling and reduced-motion behavior remain available.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3 — intentional control reduction] Attachment and search actions shown in the visual reference are omitted because the final requirement explicitly limits the composer to voice and send.
- [P3 — intentional motion restraint] The implemented orb has lower visual mass and slower deformation than the original reference, matching the user's request for a smaller, subtler AI signal.

## Validation

- 30 automated tests passed.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed.

## Final result

passed

---

# Design QA — Adaptive portfolio chat

## Source visual truth

- Approved concept: `/Users/mateoespinosa/.codex/generated_images/019fe208-fe38-7ca0-a45b-9153cd2cf5a3/exec-198fb5b9-02d0-4d09-b9bc-569460b999ea.png`
- Source dimensions: 853 × 1844 px.
- Source state: a mobile answer showing a warm-paper project carousel, vintage covers, metrics, case-study actions and follow-up chips.
- Product requirement added after approval: each question must select a response presentation appropriate to its intent instead of reusing the carousel for every answer.

## Implementation evidence

- Mobile implementation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-mobile.png`
- Normalized side-by-side comparison: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-comparison.png`
- MiBanco case-gallery state: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-chat-case-gallery.png`
- Local URL: `http://127.0.0.1:5173/`
- Primary viewport: 390 × 844 CSS px at 1×. The 853 × 1844 source was normalized to 390 × 844 for the comparison.
- Responsive viewport checked: 1024 × 800 CSS px. The drawer measured 496 × 776 px with zero page-level horizontal overflow.

## Full-view comparison

- The implementation preserves the concept's warm paper, near-black actions, editorial type hierarchy, fine borders, circular assistant mark and compact mono metadata.
- It uses the existing grayscale/vintage project covers in the chat. The MiBanco card exposes the next project as a partial horizontal preview and uses scroll snapping, pagination and a large case-study action.
- The card is intentionally wider than the normalized concept so one project remains readable at 390 px while still revealing the next item. This also matches the earlier approved one-card-plus-peek composition.
- The dynamic lead reflects the user's actual wording rather than hard-coding the concept copy.
- The local preview correctly shows `Local · Ready`; the deployed Vercel route can show Gemini's remaining daily allowance.

## Focused comparison and states

- Project query: renders a three-item vintage carousel for MiBanco, Credicorp Capital and Dando by CFG.
- Results follow-up: replaces the carousel with three metric grids and keeps exactly the previous project scope.
- Process follow-up: renders a four-step process panel with a project switcher.
- Role follow-up: renders three role/scope/team briefs.
- Career question: renders a five-item experience timeline.
- MiBanco “Explorar caso”: opens the existing accessible dialog and exposes four real case images for research, system, product experience and outcomes.

## Accessibility and behavior checks

- Assistant and user messages have screen-reader labels; the transcript is a polite live log.
- Carousel pagination reports the active item with `aria-current`; project switchers use tab semantics; follow-up controls and case actions are native buttons.
- Global `:focus-visible` styling and reduced-motion handling remain active.
- The mobile drawer uses the full viewport, keeps the composer reachable and has no document-level horizontal overflow; horizontal scrolling is isolated to the intended carousel and project switcher.
- Escape and the close control dismiss the case dialog, and focus restoration remains handled by the existing overlay.
- Browser console contained no runtime errors during mobile and desktop checks.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3 — intentional responsive adaptation] The implementation displays one complete card plus a partial next card instead of shrinking three cards into the 390 px viewport. This preserves legibility, tapability and the carousel affordance.
- [P3 — environment state] Local Vite cannot execute the Vercel API route, so follow-up QA exercised the contextual local fallback and displayed `Local · Offline`. Production retains the Gemini route and daily-limit state.

## Iteration history

1. Replaced plain assistant text with an explicit presentation contract driven by question intent.
2. Added carousel, project spotlight, metric grid, process, role, profile and suggestion presentations.
3. Reused local vintage covers in the chat while preserving the existing real project galleries inside each case.
4. Added contextual project inheritance so “estos proyectos”, “este proyecto” and short intent follow-ups do not expand back to unrelated cases.
5. Localized short titles, process summaries, role copy, metric labels and metric details for Spanish answers.
6. Adjusted mobile transcript alignment so a new assistant answer starts directly below the fixed header.
7. Verified mobile and desktop layouts, project opening, response-style transitions, console output, tests, lint and production build.

## Final result

passed

---

# Previous QA — Portfolio project import

## Source visual truth

- Source page: <https://mateo-espinosa.framer.website/projects/modyo-platform>
- Source content set: the four projects listed at <https://mateo-espinosa.framer.website/projects>
- Source desktop capture: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-source-modyo-desktop.jpg`
- Source state: Modyo Platform detail page at the top of the case study.

## Implementation captures

- Desktop implementation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-implementation-modyo-desktop.jpg`
- Mobile implementation: `/Users/mateoespinosa/Personales/Portfolios/Portfolio-v2/design-qa-implementation-mobile-work.jpg`
- Local implementation URL: `http://localhost:4173/`
- Desktop viewport: 1280 × 720 CSS px; source and implementation captures are 1280 × 720 px at 1× normalized density.
- Mobile viewport: 390 × 844 CSS px; implementation capture is 390 × 844 px at 1× density.
- Primary implementation state: selected work section and Modyo case overlay.

## Full-view comparison

- The source page and implementation show the same Modyo project subject, title, introductory context and local project imagery.
- The implementation intentionally keeps the portfolio's existing warm-paper/editorial visual system instead of copying the source site's black Framer shell. This is a brand adaptation, not a fidelity defect for the requested import.
- The implementation exposes more structured case-study content than the source above the fold: role, scope, team and duration are added before the imported sections, gallery and outcomes.

## Focused comparison

- Compared the source hero region and implementation case-overlay hero at the same 1280 × 720 viewport using the two desktop captures above.
- Image fidelity: the source Modyo cover is copied locally and rendered as the implementation hero; no placeholder, hotlink or generated replacement is used.
- Copy fidelity: the source's Modyo description, role themes, research, design-system work, low-code module and results are represented in the overlay and local assistant data.
- Responsive check: the mobile implementation keeps four cards, readable project names, visible case-study affordances and a 390px layout without horizontal overflow.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3 — intentional brand adaptation] The source uses a dark sans-serif presentation while the portfolio uses warm paper, Bodoni Moda and Schibsted Grotesk. This is consistent with the host portfolio's existing visual language and preserves the imported content and imagery.
- [P3 — intentional composition change] The local case overlay adds metrics and a four-image gallery to make the imported projects useful as portfolio case studies rather than duplicating the source page's exact layout.

## Primary interactions tested

- Hero “Selected work” scrolls to the work section.
- All four project cards render with local hero images and open their case overlay.
- Case overlay close button works and restores the previous page position.
- Escape closes the active case overlay.
- “Next project” swaps from Modyo to MiBanco and resets the case scroll.
- Mobile cards remain usable at 390 × 844.
- Lazy-loaded gallery assets resolve locally after scrolling through the MiBanco case.
- Browser console returned no errors during desktop or mobile checks.

## Iteration history

1. Replaced the placeholder project cards with four source projects and locally bundled image assets.
2. Replaced generated case covers with the corresponding source project hero images.
3. Added structured sections, metrics, outcome lists and galleries to the case overlay.
4. Updated assistant search aliases, Spanish summaries, metric responses and tests to match the imported project set.
5. Corrected the mobile QA evidence to capture the selected work state at 390 × 844.
6. Re-ran tests, lint, production build and browser interaction checks; no P0/P1/P2 issue remained.

## Implementation checklist

- [x] Four source projects represented: Modyo Platform, MiBanco, Credicorp Capital and Dando by CFG.
- [x] Images copied locally under `public/projects/`.
- [x] No source image is hotlinked from the final implementation.
- [x] Desktop and mobile layouts checked.
- [x] Project navigation and overlay states checked.
- [x] Tests, lint and production build passed.

## Final result

passed
