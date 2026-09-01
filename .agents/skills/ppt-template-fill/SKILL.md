---
name: ppt-template-fill
description: Use when a user names a registered, verified PPT template package and wants an editable deck from a topic, a concise content basis, or source materials, with optional framework, page-count, and category-level keep/change/confirm boundaries.
---

# PPT 模板包快速填充

用已发布的模板包名称快速生成可编辑 PPTX。普通调用只需要“模板包名称 + 一个内容依据”；大框架和边界未说明时继承模板包默认值，不把用户带入逐页表单。

## 先解析模板包与最小输入

1. 只从模板库根目录的 `index.json` 解析模板包名称、别名或 `packageId@version`；默认根目录是当前工作区的 `.agents/ppt-template-packs/`，只有调用者明确给出模板库时才改用该根目录。先确认索引中的名称、版本、`status: verified` 和库内相对路径；原始模板、`profile.json` 与 `assets-manifest.json` 要等数据处理闸门完成后才读取并做 SHA-256 一致性校验。
2. 需要一个内容依据：主题、简要内容、提纲或材料链接均可。大框架可选；未提供时优先使用模板包的默认大框架。当前对话中已给出的主题也算内容依据。
3. 内容依据暂缺时，不要用长表单抢在调用者明确提出的边界确认或冲突之前；先处理当前唯一的高优先级问题，再判断默认大框架和对话上下文能否继续。若仍不能确定主题，只问一次内容依据。
4. 每个回合最多问一个紧凑问题。优先级依次为：模板包不存在或名称/版本不唯一、同一类别的直接冲突、调用者本次明确设为“每次确认”的类别、模板默认继承的“每次确认”类别、缺少内容依据、请求超出明确边界。

读取 [call-contract.md](references/call-contract.md) 获取最小调用格式和澄清文案。模板包不存在时，请用户指定已发布模板包；不要猜测切换到其它工作流。

## 数据与素材处理闸门

先解析注册表，再在读取 `package.json`、原始模板、`profile.json`、`assets-manifest.json`、用户材料或请求外部素材之前，完成简短 intake：受众/要推动的决定、数据类别、模板包、素材方式和交付形式。能从调用和包默认值推断的直接记录，不要求重复填写。

- **Green：** 公开、已批准、虚构或非敏感材料，可继续。
- **Yellow：** 内部或去标识材料；只有当前处理环境已获确认后，才能读取模板/材料或处理素材。未确认时只问这一项，不解析原件，不请求外部素材。
- **Red：** 个人、薪酬、健康、客户可识别、法律受限或其他敏感材料；在读取模板、材料、外部检索或素材生成前停止，要求汇总/虚构示例或受控流程。

素材必须遵守包内默认素材方式和资产槽。除非本次有明确的 `external-approved` 素材方式及处理/权利确认，否则不得把 `approved-external` 或 `generated` 作为外部获取或生成的授权；把最终素材来源写入 run record。

## 合并边界并生成

数据处理闸门完成后，读取 [package-resolution.md](references/package-resolution.md) 并校验三份 manifest 的源文件 SHA-256；随后加载模板包默认大框架和五类边界，再仅覆盖本次调用明确提到的类别。边界只使用 **保持** (`preserve`)、**可变** (`adapt`) 或 **每次确认** (`confirm`)；不存在全局严格模式。

读取 [boundary-merge-and-generation.md](references/boundary-merge-and-generation.md) 后：

1. 写入本次 run record，记录模板库和已验证索引版本、三份 manifest 的源文件 SHA-256、有效大框架、有效页数、五类有效边界、使用/扩展的页面和模块蓝图及素材来源。
2. `preserve` 时保持该类别的模板基线；`adapt` 时在模板字体、配色、页眉页脚、页面模块和素材槽的范围内复用或扩展；`confirm` 时只询问该类别的一项最小决定。
3. 当页面框架或模块可变时，可复用或扩展同一视觉基线；不要求存在一张完全相同的源页面。
4. 调用 **Presentations** 创建可编辑 PPTX，并逐页渲染检查可读性、溢出、对齐与选定边界。生成后的最终文件、运行记录和渲染结果放入本次输出目录。

## 使用示例

读取 [user-examples.md](references/user-examples.md)。默认调用应直接沿用模板包默认值；只有用户想变更时才追加大框架、页数或边界语句。
