---
name: ppt-template-pack-builder
description: Use when a user wants to turn an existing PPTX or POTX into a reusable named template package with a default framework, visual assets, and user-controlled keep/change/confirm boundaries.
---

# PPT 模板包制作器

把一份原始 PPTX/POTX 沉淀为可点名调用的模板包。模板包保留原件作为视觉基线，并记录可复用页面、模块、素材与默认边界；它不是要求普通使用者逐页配置的表单。

## 先确认创建意图

只在用户明确说“创建模板包”“沉淀模板”“以后按名称复用”时进入本 Skill。需要原始 PPTX/POTX、模板包名称和所有者；缺少时一次性询问这三项。默认保留原件与内嵌视觉资产到用户指定的模板包目录，除非用户明确要求仅保存画像。

需要创建时，先读取 [creation-and-confirmation.md](references/creation-and-confirmation.md)。使用 **Presentations** 检查原件的母版、布局、文本样式、页眉页脚、页码、图片、图标、Logo、图表和表格；把提取结果写入本 Skill 的 manifest 结构，而不是从截图重画样式。

## 创建流程

1. 建立 `draft` 包：复制原件为 `original-template.pptx`，计算 SHA-256，创建 `package.json`、`profile.json` 和 `assets-manifest.json`。
2. 自动提出默认大框架、页面/模块蓝图、文字容量与资产槽；不要要求创建者逐页填写对象坐标。
3. 使用 [change-boundaries.md](references/change-boundaries.md) 生成确认卡。每个类别只可设为：**保持**、**可变**或**每次确认**；不存在全局保真等级。
4. 创建者确认后，用虚构字段做样例填充并渲染。发布前读取 [package-validation.md](references/package-validation.md)。
5. 将通过的版本标为 `verified`，设置 `activeVersion`，并交付可复制调用卡片。

## 给创建者的确认卡

用普通语言回显五项：默认大框架；视觉基线、页面框架、视觉资产、内容与数据、交付形式五类边界；每类可变范围；默认内容/素材方式；名称与版本。只对创建者标记为“每次确认”的类别继续追问。

发布后给出：

```text
模板包「[名称]@[版本]」已创建。
用「[名称]」生成 PPT；大框架：[章节]；内容：[主题或材料]；边界：[本次需要改动的项目]。
```

## 参考资料

- 建包、确认卡、版本与调用教学：读 [creation-and-confirmation.md](references/creation-and-confirmation.md)。
- 用户如何控制保持/可变/每次确认：读 [change-boundaries.md](references/change-boundaries.md)。
- 样例、PPTX 与资产检查：读 [package-validation.md](references/package-validation.md)。

