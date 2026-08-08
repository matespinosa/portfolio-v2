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
