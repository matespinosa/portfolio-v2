# Design QA — Local portfolio guide

## Source truth

- Reference image: `/var/folders/7y/jrz7vkm90jz146xmd_5fttdh0000gn/T/codex-clipboard-0e65ae24-0209-4d0c-937d-bfd4493089d2.png`
- Reference dimensions: 522 × 308 px at 1× density
- Intended fidelity: preserve the prompt-first agent structure and hierarchy while applying the portfolio's existing typography, warm palette, border treatment, texture, and brand mark.

## Implementation captures

- Desktop full view: `/private/tmp/portfolio-chat-starter-current-1440x900.png`
- Desktop focused component: `/private/tmp/portfolio-chat-starter-component.png`
- Mobile full view: `/private/tmp/portfolio-chat-starter-390x844.png`
- Conversation state: `/private/tmp/portfolio-chat-conversation-1440x900.png`
- Side-by-side comparison: `/private/tmp/portfolio-chat-design-qa-comparison.png`
- Desktop viewport: 1440 × 900 px
- Focused component: 896 × 633 px at 1× density
- Mobile viewport: 390 × 844 px
- Primary state: initial prompt-first experience

## Full-view comparison

- The implementation keeps the same reading order as the reference: identity mark, centered greeting/question, prominent multiline composer, compact quick prompts, and send control.
- The chat section is centered within the existing portfolio grid and leaves intentional surrounding whitespace, matching both the reference's calm composition and the site's editorial rhythm.
- At 390 px the component uses the available width without horizontal overflow; quick prompts wrap while the send control remains touchable.

## Focused comparison

| Surface | Finding | Severity |
| --- | --- | --- |
| Typography | The reference's compact sans-serif greeting is intentionally translated into the portfolio's Bodoni editorial display with Schibsted Grotesk and Fragment Mono support. Hierarchy and centered reading order are preserved. | P3 — intentional brand adaptation |
| Spacing and layout | Mark, greeting, supporting copy, composer, suggestions, and send control follow the source hierarchy. The implementation uses more vertical breathing room to match the surrounding portfolio sections. | P3 — intentional brand adaptation |
| Colors and tokens | Cool white/blue reference colors are translated to the existing warm paper, ink, muted text, and hairline-border tokens. No isolated palette was introduced. | P3 — intentional brand adaptation |
| Image quality and assets | The existing `/public/favicon.svg` is used as the real brand asset at native vector quality. No placeholder or approximate icon asset is present. | Pass |
| Copy and content | Generic assistant copy is replaced with Mateo-specific portfolio guidance while retaining the same purpose and prompt-first interaction. | Pass |

## Functional and responsive checks

- Initial state, quick prompts, keyboard input, Enter submission, Shift+Enter handling, focus visibility, and zero horizontal overflow were checked in the in-app browser.
- After the entrance animation settles, the hero frame and terminal borders share the same top coordinate at 1440 px and 901 px; at 900 px the layout switches cleanly to the intended stacked composition.
- Sending a message transitions to the conversation layout and presents an immediate answer sourced from the portfolio data.
- Local fuzzy search, bilingual controlled responses, the 1,200-character limit, auto-scroll behavior, and `portfolio:focus-chat` event remain in the component.
- Browser console review returned no errors or warnings.
- The guide makes no `/api/chat` request and needs no API key, model download or external AI service.

## Iteration history

1. Replaced the previous terminal-like chat framing with an agent conversation surface.
2. Adjusted the initial experience after visual feedback to use the reference's prompt-first composition instead of opening directly into a transcript.
3. Compared the provided reference and the focused implementation side by side; no P0, P1, or P2 discrepancy remained.
4. Verified desktop and mobile captures, conversation transition, keyboard behavior, and horizontal overflow.

## Final result

passed
