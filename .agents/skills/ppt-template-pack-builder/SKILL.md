---
name: ppt-template-pack-builder
description: Use when a user wants to turn an existing PPTX or POTX into a reusable named template package with a default framework, visual assets, and user-controlled keep/change/confirm boundaries.
---

# PPT 模板包制作器

把一份原始 PPTX/POTX 沉淀为可点名调用的模板包。模板包保留原件作为视觉基线，并记录可复用页面、模块、素材与默认边界；它不是要求普通使用者逐页配置的表单。

## 先确认创建意图

只在用户明确说“创建模板包”“沉淀模板”“以后按名称复用”时进入本 Skill。需要原始 PPTX/POTX、模板包名称和所有者；缺少时一次性询问这三项。模板库位置可以由创建者首次指定；未指定时，使用当前工作区的 `.agents/ppt-template-packs/`。除非用户明确要求仅保存画像，否则保留原件与内嵌视觉资产。

## 模板库与名称解析

模板库根目录下固定维护 `index.json`。每个已发布版本存放为 `[模板库根目录]/[packageId]/[version]/`，其中包含 `original-template.pptx`、`package.json`、`profile.json` 和 `assets-manifest.json`。`index.json` 是模板包名称、别名、`packageId`、版本与实际目录的唯一解析来源；不要让填充器扫描任意目录或猜测文件位置。

草稿版本不写入可调用索引。创建者确认并通过验证后，才在索引写入 `status: verified`、相对 `path`、`sourceSha256` 和 `activeVersion`。更新模板时保留旧版本，在同一索引项内新增版本，再显式切换 `activeVersion`。

需要创建时，先读取 [creation-and-confirmation.md](references/creation-and-confirmation.md)。使用 **Presentations** 检查原件的母版、布局、文本样式、页眉页脚、页码、图片、图标、Logo、图表和表格；把提取结果写入本 Skill 的 manifest 结构，而不是从截图重画样式。

## 创建流程

1. 按模板库目录建立 `draft` 包：复制原件为 `original-template.pptx`，计算 SHA-256，创建 `package.json`、`profile.json` 和 `assets-manifest.json`；草稿不得出现在可调用的 `index.json` 中。
2. 自动提出默认大框架、页面/模块蓝图、文字容量与资产槽；不要要求创建者逐页填写对象坐标。
3. 使用 [change-boundaries.md](references/change-boundaries.md) 生成确认卡。每个类别只可设为：**保持**、**可变**或**每次确认**；不存在全局保真等级。
4. 创建者确认后，用虚构字段做样例填充并渲染。发布前读取 [package-validation.md](references/package-validation.md)。
5. 将通过的版本标为 `verified`，写入/更新 `index.json` 的对应版本与 `activeVersion`，并交付可复制调用卡片。

## 给创建者的确认卡

用普通语言回显五项：默认大框架；视觉基线、页面框架、视觉资产、内容与数据、交付形式五类边界；每类可变范围；默认内容/素材方式；名称与版本。只对创建者标记为“每次确认”的类别继续追问。

发布后给出：

```text
模板包「[名称]@[版本]」已创建。
用「[名称]」生成 PPT；内容：[主题、简要内容、提纲或材料]。
需要改变结构或边界时，再追加：大框架：[章节]；边界：[本次需要改动的项目]。
```

## 参考资料

- 建包、确认卡、版本与调用教学：读 [creation-and-confirmation.md](references/creation-and-confirmation.md)。
- 用户如何控制保持/可变/每次确认：读 [change-boundaries.md](references/change-boundaries.md)。
- 样例、PPTX 与资产检查：读 [package-validation.md](references/package-validation.md)。
