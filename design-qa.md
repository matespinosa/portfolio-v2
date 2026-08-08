# Design QA — Portfolio project import

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
