---
name: ppt-template-studio
version: 1.0.0
description: "当用户在 WorkBuddy 中要把现有 PPTX/POTX 沉淀成可点名复用的模板包、用已命名模板包生成 PPT，或在没有模板包时制作一份可编辑商务 PPTX 时使用。"
description_zh: "WorkBuddy PPT 模板包与可编辑 PPTX 制作：首次建包，后续用模板名加内容快速生成。"
allowed-tools: Bash, Read, Write, Edit
metadata:
  defaultTemplateLibrary: "ppt-template-library"
  requiredPptxCapabilities:
    - editable-pptx
    - render-or-preview
---

# PPT Template Studio（WorkBuddy）

这是一个可上传到 WorkBuddy 的单一 Skill 包。它把三件事放在同一入口：把原始 PPTX/POTX 建成模板包、按已命名模板包生成 PPT、没有模板包时新建商务 PPT。

## 先路由，再行动

按以下优先级判断，不需要用户输入 Codex 的 `$...` 语法：

1. 用户明确说“建模板包”“沉淀模板”，并给出或准备给出 PPTX/POTX：进入 `build-template-package`。
2. 用户点名了模板包显示名、别名或 `packageId@version`：进入 `template-fill`。即使名称未解析，也不能改走“新建 PPT”。
3. 只有未点名模板包时，才进入 `ppt-studio` 新建路线。

读取 [适配契约](references/adapter-contract.json)，并在需要执行时读取 [模板包工作流](references/template-package-workflow.md)。

## 最快的日常调用

日常用户只需提供模板包名和内容依据：

```text
用「市场调研·活力手账」生成 PPT；内容：XR 直播间市场调研，面向内部领导。
```

大纲、页数、字数和本次边界都可选。没有说明时，继承模板包默认设置；不要把用户带入逐页填写表单。

```text
用「市场调研·活力手账」生成 PPT；内容：XR 直播间市场调研。
页数：12；大框架：市场趋势、产品地图、技术路线、结论建议。
边界：字体、配色、页眉页脚保持；封面图和正文配图可变；允许新增两页。
```

## 模板包工作区

用户在 WorkBuddy 任务中选择一个工作区。默认在其根目录寻找 `ppt-template-library/index.json`；用户明确给出模板库根目录时，以该目录为准。上传本 Skill 时不要把真实模板库或原始 PPTX 一起打包。

模板库的最小结构：

```text
<工作区>/ppt-template-library/
├── index.json
└── <packageId>/<version>/
    ├── original-template.pptx
    ├── package.json
    ├── profile.json
    └── assets-manifest.json
```

`index.json` 是模板包名称、别名、版本和目录的唯一解析来源。按名称调用时只使用其中标记为 `verified` 的版本；原件和三份 manifest 的 SHA-256 必须一致。可在具备 Node 运行环境时使用随包的 `scripts/template-package-resolver.mjs` 得到结构化解析结果。

## 1. 建立模板包

只在用户明确要“以后按名称复用”时建包。首次仅收集三项：原始 PPTX/POTX、模板包名称、所有者。其他信息可从原件自动提取或使用默认值。
若用户只给了无法读取的路径，先只请其将原件添加到当前 WorkBuddy 工作区；拿到原件后再继续，不追加长表单。

使用当前可用的 PPTX 文档能力读取原件，保留原始模板，提取母版、页面类型、字体、配色、页眉页脚、页码、图片、图标、Logo、文字容量和可复用模块。图片、图标和封面素材要记录来源页、对象锚点、替换规则和适用范围，以便后续复用。

提取后用一张确认卡让创建者只确认：默认大框架，以及五类边界中哪些保持、可变、每次确认。不要要求创建者填写逐页坐标或长表单。确认后写入模板库并给出下面的调用卡：

```text
模板包「[名称]@[版本]」已创建。
用「[名称]」生成 PPT；内容：[主题、简要内容、提纲或材料]。
```

## 2. 用模板包生成 PPT

先从 `index.json` 解析名称，检查版本和原件/manifest 一致性，再载入模板。一个模板包有五类边界，分别是：视觉基线、页面框架、视觉资产、内容与数据、交付形式。每一类单独使用以下状态：

| 状态 | 含义 |
| --- | --- |
| `preserve`（保持） | 继续使用模板已有规则。 |
| `adapt`（可变） | 在同一视觉体系中复用或扩展。 |
| `confirm`（每次确认） | 本次只询问这一类的一项决定。 |

本次输入只覆盖明确提到的类别，其他沿用包默认值。每回合最多问一个紧凑问题；仅在名称/版本不唯一、边界冲突、需要确认或缺少内容依据时提问。

使用 PPTX 文档能力基于原始模板生成可编辑 PPTX。保持项必须沿用原始字体、配色、页眉页脚、页码和相应布局；可变项优先填入已记录的资产槽和文本区。生成后应能预览或逐页渲染检查文字溢出、图片裁切、对齐和页码。

## 3. 没有模板包时新建 PPT

阅读 [无模板新建工作流](references/new-presentation-workflow.md)。只收集当前无法从对话推断的信息：主题/内容依据、受众与要推动的决定、以及页面数量或视觉方向（如用户未给）。题目、受众和目的已清楚时，直接给出简短大纲并制作，不要求逐页字段。市场调研类内容优先使用用户材料或可核验公开来源；当前任务没有材料或检索能力时，用待补数据占位并说明，不能把推测写成市场事实。

封面图、正文图片、图标和描述性素材要按其在页面中的角色准备；同一份新建 PPT 保持一个一致的视觉系统。用户明确提供参考 PPT 时，应按其布局和素材槽制作，不用截图重画。

## PPTX 运行前提

进入三条路线中的任何一条前，先确认当前 WorkBuddy 任务可完成两项：生成可编辑 PPTX，以及预览或渲染页面。WorkBuddy 的办公文档套件通常提供 `PPTX` 能力；若当前任务不可用，应直接说明需要启用或选择该能力，不要承诺一个不存在的 PPTX 文件。具体执行方式见 [PPTX 执行说明](references/pptx-execution.md)。
