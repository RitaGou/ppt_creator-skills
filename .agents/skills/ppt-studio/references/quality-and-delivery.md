# Quality and delivery

## Required quality gates

### 1. Narrative and evidence

- State the communication job, decision, and audience before drafting.
- Ensure the storyline accumulates toward a decision or behavior; one slide has one main idea and an action-title where appropriate.
- Never invent metrics, case studies, customer endorsements, quotations, market claims, or causal explanations.
- Mark assumptions, estimates, confidence limits, and unknowns clearly.

### 2. Template and provenance

- For a designated template, verify that every output slide has an approved source-slide/layout map and that the original file hash is unchanged.
- Keep theme, master, placeholders, page chrome, footer, and source zones intact.
- Put sources for external media and factual claims in speaker notes.
- Keep asset provenance, rights status, crop notes, and reuse scope in the deck's asset manifest.
- Keep the template selection reason, source hash, profile status, and each slide mapping in the generation manifest.

### 3. Visual and editable-PPTX review

Use **Presentations** to render every final slide. Inspect at normal reading size and at least one overview/contact-sheet view for:

- overflow, clipping, overlap, broken wrapping, unreadably small text, empty placeholders, and incorrect page numbering;
- distorted crops, cropped-off subjects, stretched raster visuals, and inconsistent icon treatment;
- data/chart mismatch, mislabeled values, and an unsupported visual implication;
- unintended remnants of template sample text, client names, hidden notes, or speaker-note content;
- whether the deck opens as editable PPTX and the asset folder/manifests match the embedded visuals.

Fix observed defects and render again. If rendering, source inspection, or template import is unavailable, state the exact blocked gate and do not claim visual acceptance.

## Delivery checklist

Provide:

1. editable PPTX;
2. deck-local asset folder, asset manifest, and generation manifest;
3. a concise route summary: data class, scenario preset/custom narrative, template mode, asset policy, disposition;
4. source/rights exceptions, assumptions, and blocked checks; and
5. when relevant, the compact ghost-deck map for handoff or revision.

Keep **local file creation**, **render QA**, **human acceptance**, **commit/push**, and **release/distribution** as separate states. Do not claim the latter states unless they were actually completed.

## Forward-test prompts for maintainers

Run these as dry route checks in separate clean output folders. Use fictional data and field markers only; never place real restricted information in a test. Each test must make the full route observable: data class → preset → template mode → asset policy → disposition.

| Prompt type | Expected route | Non-negotiable result |
|---|---|---|
| Quarterly review with supplied logo, cover photo, and metric icons | green → quarterly business review → `template.mode=none` → supplied-only → generated; `asset-manifest.deck.visualRoute=default-layout` | Input numbers appear exactly or are directly calculated; an editable PPTX, manifests, and render review are produced. |
| De-identified customer proposal with an uploaded and explicitly designated PPTX template | yellow → client solution → `template.mode=designated` → approved-internal-only → generated; `handlingEnvironmentApproval.status=confirmed`; `template.availability=available`; `asset-manifest.deck.visualRoute=reference-template` | Approval reference, original `sourceHashBefore/sourceHashAfter`, read-only working copy, and approved per-slide mappings are recorded; master/layout/page numbering preserved; `assetAudit.externalAssetRequestStatus=prohibited`. |
| Safety training with prescribed photos/icons and an approved safety policy or named content owner | green → employee training → `template.mode=none` → supplied-only → generated; `asset-manifest.deck.visualRoute=default-layout` | Cover uses the named photo; no added external/generated visual; all listed assets map to slides and the instruction source is named. |
| Strategy roadmap with fictional inputs and no visual direction | green → strategy and roadmap → `template.mode=none` → bounded-default → generated; `asset-manifest.deck.visualRoute=default-layout` | The deck has a clear ghost-deck narrative and default layouts, but does not invent a company template, facts, or decorative media. |
| Hash-verified executive template chosen from the approved registry | green → quarterly business review → `template.mode=registry` → approved-internal-only → generated; `asset-manifest.deck.visualRoute=registry-template` | One eligible primary template is selected by precedence; its hash/profile and every output slide mapping appear in the generation manifest. |
| 信息不足：“帮我做一份 PPT” | unclassified → not-applicable (intake) → `template.mode=not-applicable` → pending-classification → awaiting-input; `run.intake.status=awaiting-input`; `run.blockReason=input-incomplete` | Only return the compact missing-information questions; no ghost deck, template inspection, asset request, PPTX, or asset folder. |
| Two approved registry templates share the highest matching priority | green → quarterly business review → `template.mode=registry` → approved-internal-only → awaiting-input; `run.intake.status=awaiting-input`; `run.blockReason=template-selection-ambiguous` | Ask the user to select one registry ID; do not blend, substitute, create a PPTX, or create an asset folder. |
| 已验证模板的源文件在 profile 后发生变化 | green → quarterly business review → `template.mode=registry` → approved-internal-only → blocked; `template.availability=unverified`; `run.blockReason=template-profile-refresh-required` | Set the entry to `enabled:false`; no PPTX or asset folder until the hash, profile, sample render, and owner approval are refreshed. |
| Missing designated template | green → not-applicable (template locator) → `template.mode=designated` → not-applicable → blocked; `template.availability=unavailable`; `run.blockReason=template-not-found`; `assetManifestPath=null`; `slides=[]` | No PPTX or asset generation; offer upload, corrected path, or explicit authorization for another route. |
| HR performance material with names, compensation, and leave data | red → not-applicable (safety stop) → `template.mode=not-applicable` → not-applicable → blocked; `run.blockReason=safety-data-boundary-stop`; `assetManifestPath=null`; `slides=[]` | No parsing, external retrieval, temporary deck, or asset generation; offer aggregate/fictitious/approved-process alternatives. |
