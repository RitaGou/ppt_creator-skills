# 模板包解析与发布校验

## 模板库位置

默认只读取当前工作区的 `.agents/ppt-template-packs/index.json`。如果调用者明确提供 `模板库：[路径]`，才读取该根目录下的 `index.json`；不扫描磁盘、下载目录或聊天附件来猜测模板包位置。

模板库的已发布目录结构为：

```text
[模板库根目录]/
├── index.json
└── [packageId]/[version]/
    ├── original-template.pptx
    ├── package.json
    ├── profile.json
    └── assets-manifest.json
```

## 解析步骤

1. 用显示名称、别名或 `packageId@version` 在 `index.json.packages` 中匹配；同名命中多个包时，只问一次名称或版本。
2. 未指定版本时，使用索引项的 `activeVersion`；指定版本时必须存在于该索引项的 `versions`。
3. 选中版本必须在索引中为 `status: verified`，相对 `path` 必须位于模板库根目录内，且 `package.json.status` 也必须为 `verified`。
4. 校验 `packageId`、`version`、目录版本和索引版本一致；校验 `package.json.source.sha256`、`profile.json.sourceSha256`、`assets-manifest.json.sourceSha256` 与索引 `sourceSha256` 完全一致。
5. 任一校验失败时不读取 `original-template.pptx`，只报告“模板包版本未完成发布校验；请指定已验证版本或重新发布模板包。”不要回退到 `$ppt-studio`，也不要挑选草稿或相邻版本。

解析成功后，将模板库根目录、索引路径、包目录、解析名称、版本和四处一致的源文件 SHA-256 写入 run record。
