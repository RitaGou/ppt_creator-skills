# Visual asset system

## Goal

Make visual assets useful, traceable, and reusable without creating a generic library that conflicts with a later brand template or leaks private material. Every deck receives:

~~~text
[deck output]/
├── [deck].pptx
└── deck-assets/
    ├── asset-manifest.json
    ├── generation-manifest.json
    ├── images/
    ├── icons/
    └── source/
~~~

Start from the bundled manifests, adapt them to the deck, and leave the assets list empty only when no visual asset is genuinely necessary.

## Asset policy is a hard boundary

Choose and record exactly one policy before acquiring visuals:

| Policy | What is permitted | What is prohibited |
|---|---|---|
| supplied-only | Explicitly listed user/company assets and native charts/diagrams from permitted source data | External image/icon search, licensed-library download, and generated images. |
| approved-internal-only | Assets from a confirmed approved internal environment | Any external retrieval or generation unless separately approved. |
| bounded-default | The smallest non-factual visual treatment needed by a clear public/fictional brief | Inventing a company template, factual imagery, proprietary logos, or decorative media that adds no understanding. |
| external-approved | Source/generation after the owner, data boundary, and rights/processing approval are recorded | Any use outside the recorded approval scope. |

If the user says “do not generate images” but does not say whether external search is allowed, use `awaiting-input`; do not guess. If they say “only use these assets,” use `supplied-only`.

## Plan each asset before acquiring it

For each candidate asset, capture:

| Field | What to record |
|---|---|
| Asset ID and role | Examples: cover hero, section image, information icon, chart, diagram, real screenshot, authentic logo. |
| Slide binding | Exact target slide number(s) and visual purpose. |
| Method | User-supplied, official source, licensed library, generated image, native chart, or native diagram. |
| Provenance | Original file path, source URL, or the complete image-generation prompt/model/purpose. |
| Rights and retention | Rights status, owner if known, and reuse scope. |
| Crop and placement | Aspect ratio, focal area, placement zone, and crop caveat. |
| Citation state | Whether an external source or factual claim is present in speaker notes. |

## Acquisition order and rules

1. **User/company-approved asset:** use it as supplied, keep its original alongside the prepared crop if allowed, and record the approved scope.
2. **Official source:** use a real logo, product capture, person, place, or factual image only from an official or user-approved source. Preserve its URL and rights review state.
3. **Licensed source:** record the source, license/terms, attribution need, and any no-redistribution restriction before promotion.
4. **Generated image:** use only for a non-factual illustrative scene. Load the image-generation capability before generating raster imagery. Record prompt, model, and purpose. Never generate factual evidence, real people, logos, product interfaces, or a client/company lookalike.
5. **Native chart or diagram:** use editable slide-native content where evidence or relationships are better represented structurally than with an image.
6. **No asset:** leave space or use typography when an image does not improve comprehension.

For yellow material, first confirm the current handling environment is approved. Until then, do not inspect a template, acquire an asset, or generate a deck. After confirmation, use only user-provided/internal approved assets unless the user explicitly authorizes external processing. An unresolved rights record may not be promoted as reusable. For red material, do not source, generate, or retain assets.

## Consistency and crop checks

- Pick one icon family, visual weight, stroke logic, and color treatment per deck.
- Reuse a hero image only when it is intentionally a recurring background; otherwise use each image once.
- Never stretch an image. Crop to protect the focal subject and inspect the final rendered slide, not only the source image.
- Pair an icon with a meaningful label; decorative symbols do not replace evidence or instructions.
- Keep a real screenshot readable and unaltered enough to remain honest; label concept imagery as concept imagery.

## Reuse and promotion

Use one of these manifest values:

| Reuse scope | Meaning |
|---|---|
| deck-only | Retain beside this deck only; it may be referenced by a later run when the user supplies this asset folder. |
| reusable-company-approved | The owner has approved reuse in the stated company/library target. Record owner, target, and rights state before copying there. |
| not-retain | Use only transiently where allowed, then do not add it to a reusable folder. |

Never promote an asset merely because it looks reusable. Do it only when the user/company specifies a destination and confirms the rights/retention scope. The manifest makes later reuse discoverable without copying assets into a generic library by default.

## Speaker notes and delivery

Put source URLs for external media and factual visual claims in the relevant slide's speaker notes. Deliver both manifests with all asset-bearing decks. If an asset has unresolved rights, flag it in the delivery summary and do not mark it reusable.
