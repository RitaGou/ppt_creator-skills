# Template registry and profiling

Use a template registry only after a template owner has approved its retention and the registry has a verified source hash. Start from [template-registry.template.json](../assets/template-registry.template.json). It is metadata only: do not place the binary template in this Skill or repository by default.

## Selection order

Select exactly one primary template, in this order:

1. an enabled registry entry explicitly named by the user and eligible under the checks below;
2. the sole eligible enabled registry entry whose `useWhen` matches and whose numeric `priority` is highest; or
3. ask the user to select an approved registry entry, designate a reference template, or choose another visual route.

A file named by the user but not present as an approved registry entry belongs to the designated reference-template route, not this registry route. If two entries tie for the highest priority, ask rather than breaking the tie implicitly.

An entry is eligible only when `enabled` is `true`, the actual source file matches `source.sha256`, `profile.status` is `verified`, `profile.profiledSha256` matches `source.sha256`, and its `owner` plus `retentionAndDistribution` record explicit approved use. If the named entry is missing, unreadable, disabled, hash-mismatched, or lacks a verified profile, stop and explain why. Do not replace it with a generic theme, a blank deck, or another template. The user may explicitly authorize a different visual route.

## Minimum profile

For each approved template, record a profile that remains bound to its source SHA-256:

| Profile item | Purpose |
|---|---|
| Slide size and theme | Prevent incorrect aspect ratio or reconstructed colours/fonts. |
| Masters and layouts | Identify permitted source layouts and their semantic roles. |
| Placeholder ID/type/geometry | Keep content in valid title, body, table, image, and footer zones. |
| Layout signature and source-slide candidates | Map ghost-deck roles to actual slides without guessing. |
| Fixed/non-removable slides and page chrome | Protect legal notices, page numbering, background art, and footers. |
| Logo/media/font/chart/table baselines | Preserve branded parts and flag replacements that need approval. |
| Profiled source hash and version | Force reprofiling when the underlying PPTX/POTX changes. |

Use semantic layout IDs or roles in the generation record rather than raw palette values, font names, or layout indexes.

## 模板生命周期：多套模板的沉淀、使用与优化

The registry is a metadata catalog with one object in `templates[]` for every approved template; it can retain many template records without copying template binaries into this Skill or repository.

### Add and enable

1. Confirm the template owner, approved retention/distribution scope, and source location. A one-off user file is not registry material by default.
2. Record a stable `id`, business contexts in `useWhen`, source SHA-256, owner, and retention scope with `enabled: false`.
3. Inspect the approved source, create its profile and semantic layout catalog, and bind `profile.profiledSha256` to the source hash.
4. Run a fictional green sample for each intended scenario, render every slide, record its sample-run reference and limitations, then set `profile.status: verified`, the quality evidence, and `enabled: true` only when the owner approves the result.

### Use

Ask for a named registry ID when the user has a preference. Otherwise use the selection order above: an eligible named entry wins; the sole highest-priority eligible context match may be selected; a tie, absent match, or unverified entry returns to `awaiting-input`. Do not blend multiple templates or silently substitute one.

### Optimize, update, and retire

Use each deck's generation manifest and render findings to record layout failures, unreadable zones, missing roles, and scenario fit in the entry's `quality` section. Improve the profile/catalog or priority only when its source hash still matches. If the source PPTX/POTX changes, record the new hash, set `profile.status: refresh-required`, set `enabled: false`, reprofile and retest before re-enabling. Retire a template by setting `enabled: false` while retaining the metadata and prior run evidence; never overwrite a historical hash or delete the audit trail merely to make selection simpler.

## Single-primary-template rule for v1

This Skill never silently blends templates. A user may request a single explicitly selected template. If a future approved advanced mode permits multiple inputs, the primary template must own all master/layout relationships and the generation record must name every secondary source and conflict. Never merge OOXML pointers, media, logos, or template-specific styles automatically.
