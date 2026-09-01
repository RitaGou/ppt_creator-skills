# Inspiration, compatibility, and license boundaries

This Skill is an original Codex-oriented implementation. It does not copy external runtime code, scripts, or proprietary prompt text.

| Reference | What informed this Skill | Compatibility and boundary |
|---|---|---|
| [Anthropic financial-services ppt-template-creator](https://github.com/anthropics/financial-services/blob/69cbc81467a5dced793eee03dec4658aa24ef856/plugins/vertical-plugins/financial-analysis/skills/ppt-template-creator/SKILL.md) | Template inventory, safe content zones, sample/validation thinking | The containing repository is [Apache-2.0](https://github.com/anthropics/financial-services/blob/69cbc81467a5dced793eee03dec4658aa24ef856/LICENSE). This project adapts high-level ideas only; any future redistribution that incorporates source material must preserve required Apache notices. |
| [Anthropic PPTX Skill terms](https://github.com/anthropics/skills/blob/3b3fad96af16a10759d930941b4520ba0c40edae/skills/pptx/LICENSE.txt) | High-level reminder to separate deck planning, production, and visual QA | The linked PPTX Skill materials are agreement-governed and prohibit extraction, retention, copying, derivatives, and distribution. Do not copy, adapt, distribute, or use their PPTX scripts/prompts as an implementation base. |
| [BrandDocs brand-pptx](https://github.com/ferdinandobons/brand-docs/tree/97a6e384cb0664cd44ba8113c0b80c9761700670) | Verify-before-generate brand profile and template-shell preservation | Use only as an [MIT-licensed](https://github.com/ferdinandobons/brand-docs/blob/97a6e384cb0664cd44ba8113c0b80c9761700670/LICENSE) conceptual reference; this Skill relies on installed Codex Presentations rather than its runtime. |
| [pptx-from-layouts](https://github.com/tristan-mcinnis/pptx-from-layouts-skill/blob/46e7c6638305bcb424f257b5c49dcd2603dc71ea/SKILL.md) | Layout catalog and semantic slide-role mapping | Use as an [MIT-licensed](https://github.com/tristan-mcinnis/pptx-from-layouts-skill/blob/46e7c6638305bcb424f257b5c49dcd2603dc71ea/LICENSE) conceptual reference; never infer a layout catalog without inspecting the actual user-designated template. |
| [presentation-skill](https://github.com/siril9/presentation-skill/blob/311e29920c7c7ab37a93c12676bab7baecc0f4a6/SKILL.md) | Source-first outline, asset plan, and review gates | Use as an [MIT-licensed](https://github.com/siril9/presentation-skill/blob/311e29920c7c7ab37a93c12676bab7baecc0f4a6/LICENSE) conceptual reference. |
| [ai-presentation-builder](https://github.com/umarmsharif/ai-presentation-builder/blob/055dfc6a42a9a0a841a628cecdca47659f3aa237/SKILL.md) | Ghost-deck checkpoint before a full build | Use as an [MIT-licensed](https://github.com/umarmsharif/ai-presentation-builder/blob/055dfc6a42a9a0a841a628cecdca47659f3aa237/LICENSE) product-flow inspiration. |
| [Microsoft brand-template-enforcer](https://github.com/microsoft/cat-agent-skills/blob/7bd5608a21b8a83129fd460a7e6e89663774458e/submissions/brand-template-enforcer/SKILL.md) | Multiple-template precedence and no-silent-fallback behavior | Use as an [MIT-licensed](https://github.com/microsoft/cat-agent-skills/blob/7bd5608a21b8a83129fd460a7e6e89663774458e/LICENSE) conceptual reference. |

Verified: 2026-09-01. These are inspiration-only references; copied material: none.

## Codex runtime compatibility

Actual PPTX creation, template reuse, rendering, and slide-level QA are delegated to the installed **Presentations** Skill. Its artifact-tool workflow is the authoritative production path in this environment. Do not substitute python-pptx, direct OOXML mutation, or a generic image library for that workflow.

## User-supplied intellectual property

The right to use a PowerPoint template, logo, font, screenshot, photo, or embedded media remains with its owner. One-off deck creation does not grant permission to store it in a shared repository, package it into a reusable Skill, or redistribute it. Require an explicit owner/rights decision before such retention or distribution.
