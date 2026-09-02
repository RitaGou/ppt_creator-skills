# 模板包工作流

## 初次建包

创建者只需给出原始 PPTX/POTX、模板包名称和所有者。模板库首次默认使用当前工作区的 `ppt-template-library/`；若创建者指定另一个根目录，后续按指定根目录保存。

建立以下版本目录：

```text
<模板库>/<packageId>/<version>/
├── original-template.pptx
├── package.json
├── profile.json
└── assets-manifest.json
```

`package.json` 记录默认大纲、页数、语言、字数、边界和原始模板 SHA-256；`profile.json` 记录页面/模块蓝图、可编辑区域、文字容量、字体和页眉页脚；`assets-manifest.json` 记录封面图、正文图片、图标、Logo 等素材的来源页、锚点和替换方式。

不要在创建开始时要求逐页坐标。先从原件提取信息，再向创建者回显一张确认卡：

```text
模板包：市场调研·活力手账@v1
默认大框架：市场趋势、产品地图、技术路线、结论建议

保持：字体、配色、页眉页脚、页码
可变：封面图、正文配图、页内模块、数据图表
每次确认：页数

可变范围：封面图可按主题替换；正文配图可按内容替换；可新增两页。
```

创建者可直接修改其中某一行。完成后才在模板库 `index.json` 登记可调用版本和 `activeVersion`。

## 填充模板包

最短调用格式：

```text
用「[模板包名称]」生成 PPT；内容：[主题、简要内容、提纲或材料]。
```

可选覆盖：

- `大框架：[章节]`
- `页数：[正整数]`
- `边界：[本次保持、可变或每次确认的内容]`
- `每页不超过 [N] 字`、语言或交付形式

未写的内容使用模板包默认值。每次只处理一个真正阻塞的问题：模板名称/版本、直接冲突、每次确认项、内容依据或超出本次边界。不要一次性追问逐页标题、图片、数据和版式。

## 五类边界

| 类别 | 常见对象 |
| --- | --- |
| `visualBaseline` | 配色、字体、字号层级、页眉页脚、页码、背景、Logo |
| `pageFramework` | 页数、章节顺序、页面类型、页内模块、新增页面 |
| `visualAssets` | 封面图、正文图片、图标、插图、图表、模板资产 |
| `contentAndData` | 标题语气、字数、内容扩写、资料补充、数据呈现 |
| `delivery` | 语言、可编辑性、备注、文件命名 |

状态只使用 `preserve`、`adapt`、`confirm`。调用者本次明确提到的类别覆盖默认值；未提及类别保持默认值。没有全局“严格”开关。

## 模板解析

按名称、别名或 `packageId@version` 只从 `index.json` 解析。未指定版本时使用 `activeVersion`。模板库路径、目录版本、`packageId`、`package.json` 状态、原件 SHA-256、`profile.json.sourceSha256` 与 `assets-manifest.json.sourceSha256` 必须相互对应。

当前环境提供 Node 时，可运行：

```text
node scripts/template-package-resolver.mjs --library-root "<模板库根目录>" --template-ref "市场调研·活力手账" --content "XR 直播间市场调研" --capabilities editable-pptx,render-or-preview
```

要启动建包路线，可运行：

```text
node scripts/template-package-resolver.mjs --operation build-template-package --template-source "<原始 PPTX/POTX>" --template-package-name "市场调研·活力手账" --template-package-owner "模板所有者" --capabilities editable-pptx,render-or-preview
```

该脚本负责三条路线的判定与已发布模板包的检查，不生成 PPT 或写入模板库；PPTX 制作和建包落盘仍交给 WorkBuddy 当前可用的 PPTX 文档能力。
