# 边界合并与生成

## 合并顺序

1. 按 [package-resolution.md](package-resolution.md) 从 `index.json` 解析模板包名称与版本；未指定版本时使用索引的 `activeVersion`，不使用草稿或猜测相邻目录。
2. 验证索引、`package.json`、`profile.json`、`assets-manifest.json` 和源文件 SHA-256 后，读取 `package.json` 中的 `framework`、`defaults` 与五类 `boundaries`，以及页面/模块蓝图和素材槽。
3. 以模板包默认大框架、`framework.defaultPageCount` 和边界创建本次有效值。
4. 仅用调用者明确提到的类别覆盖对应默认值；未提到的类别不能被间接改写。
5. `页数：[N]` 必须是正整数，并归入 `pageFramework`：该类别为 `adapt` 时写入 `input.pageCountOverride` 与 `effective.pageCount`；为 `confirm` 时先问结构是否可调整；为 `preserve` 时按“超出明确边界”处理。未给页数时沿用 `framework.defaultPageCount`。
6. 检查矛盾与 `confirm`。若同轮存在多个待办项，顺序是：包/版本发布校验、同类直接冲突、调用者明确的 `confirm`、继承的 `confirm`、内容缺口、超出边界；每回合只提最高优先级的一项。确认结果写回 run record。

## 五类边界

| 类别 | 保持 | 可变 | 每次确认 |
| --- | --- | --- | --- |
| `visualBaseline` | 字体、配色、字号层级、背景、页眉页脚、页码、Logo 沿用包内基线 | 仅在本次明确允许时调整视觉基线 | 先问视觉基线是否可调整 |
| `pageFramework` | 沿用默认章节、页数和蓝图 | 复用或扩展同一基线的页面/模块，可新增页面或用 `页数：[N]` 覆盖 | 先问结构是否可调整 |
| `visualAssets` | 保留包内指定素材或槽位 | 替换已允许的封面图、正文图、图标或插图 | 先问素材是否可替换 |
| `contentAndData` | 沿用已批准文案/数据范围 | 写入新内容、扩写或创建原生图表 | 先问内容/数据范围 |
| `delivery` | 沿用语言、可编辑性、备注与命名约定 | 仅在本次明确允许时改变交付形式 | 先问交付形式 |

## 生成步骤

1. 为每个章节匹配包内 `pageBlueprints` 或 `moduleBlueprints`；若页面框架可变，可扩展相同视觉基线的蓝图，并记录到 `generation.expandedModules`。
2. 将内容写入 `editableZones`，遵守 `textCapacity` 与本次字数限制；不把内容压进固定截图。
3. 对可变素材优先使用包内 `assetSlots` 和记录的来源/替换规则；将最终来源写入 `generation.assets`。
4. 使用 **Presentations** 生成可编辑 PPTX，保留允许保持的母版、字体、色彩、页眉页脚及其他样式基线。
5. 渲染每一页并记录 `checks`：页数、文本可读性、溢出、对齐、可编辑性、有效边界映射。仅修正已允许可变的类别。

## 运行记录要求

`effective.boundaries` 必须始终包含五个类别的直接状态值：`visualBaseline`、`pageFramework`、`visualAssets`、`contentAndData`、`delivery`，每个值只能是 `preserve`、`adapt` 或 `confirm`。`input.pageCountOverride` 可为 `null` 或正整数；`effective.pageCount` 必须是本次实际使用的正整数。不得把未声明的类别改为 `adapt`，不得用全局模式覆盖类别边界。
