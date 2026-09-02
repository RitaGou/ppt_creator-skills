import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const here = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = process.env.FIXTURE_LIBRARY_ROOT
  ? path.resolve(process.env.FIXTURE_LIBRARY_ROOT)
  : path.resolve(here, "fixtures", "template-library");
const packageId = "market-research-playful";
const version = "v1";
const packagePath = path.join(libraryRoot, packageId, version);
const sourcePath = path.join(packagePath, "original-template.pptx");

async function writeJson(fileName, value) {
  await fs.writeFile(
    path.join(packagePath, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function buildFixtureDeck() {
  const presentation = Presentation.create({
    slideSize: { width: 1280, height: 720 },
  });
  const slide = presentation.slides.add();
  slide.background.fill = "white";

  const title = slide.shapes.add({
    geometry: "textbox",
    position: { left: 88, top: 116, width: 800, height: 94 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  title.text = "市场调研模板 · 虚构样例";
  title.text.style = { fontSize: 48, bold: true, color: "slate-950" };

  const subtitle = slide.shapes.add({
    geometry: "textbox",
    position: { left: 92, top: 228, width: 700, height: 48 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  subtitle.text = "用于验证模板包解析与可编辑 PPTX 容器。";
  subtitle.text.style = { fontSize: 22, color: "slate-600" };

  const bubble = slide.shapes.add({
    geometry: "ellipse",
    position: { left: 850, top: 106, width: 252, height: 252 },
    fill: "emerald-400",
    line: { style: "solid", fill: "emerald-400", width: 1 },
  });
  bubble.opacity = 92;

  const card = slide.shapes.add({
    geometry: "roundRect",
    position: { left: 88, top: 390, width: 930, height: 150 },
    fill: "slate-50",
    line: { style: "solid", fill: "slate-200", width: 1 },
    borderRadius: "rounded-xl",
  });
  card.text = "保持：字体、配色、页眉页脚    可变：封面图、正文配图、页面模块";
  card.text.style = { fontSize: 22, color: "slate-700" };

  const footer = slide.shapes.add({
    geometry: "textbox",
    position: { left: 92, top: 640, width: 320, height: 26 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  footer.text = "PPT Template Studio fixture";
  footer.text.style = { fontSize: 12, color: "slate-400" };

  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  if (process.env.FIXTURE_RENDER_PATH) {
    await writeBlob(process.env.FIXTURE_RENDER_PATH, preview);
  }
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(sourcePath);
}

async function main() {
  await fs.mkdir(packagePath, { recursive: true });
  await buildFixtureDeck();
  const sourceSha256 = createHash("sha256")
    .update(await fs.readFile(sourcePath))
    .digest("hex");

  await fs.writeFile(
    path.join(libraryRoot, "index.json"),
    `${JSON.stringify({
      schemaVersion: "1.0",
      packages: [
        {
          displayName: "市场调研·活力手账",
          aliases: ["活力手账"],
          packageId,
          activeVersion: version,
          versions: [
            {
              version,
              status: "verified",
              path: `${packageId}/${version}`,
              sourceSha256,
            },
          ],
        },
      ],
    }, null, 2)}\n`,
    "utf8",
  );

  await writeJson("package.json", {
    schemaVersion: "1.0",
    packageId,
    displayName: "市场调研·活力手账",
    aliases: ["活力手账"],
    version,
    status: "verified",
    source: { file: "original-template.pptx", sha256: sourceSha256 },
    framework: {
      defaultOutline: ["市场趋势", "产品地图", "技术路线", "结论建议"],
      defaultPageCount: 12,
      pageBlueprintIds: ["cover", "market-map", "conclusion"],
    },
    defaults: {
      language: "zh-CN",
      maxWordsPerSlide: 70,
      contentPolicy: "template-default",
      assetPolicy: "template-default",
    },
    boundaries: {
      visualBaseline: "preserve",
      pageFramework: "adapt",
      visualAssets: "adapt",
      contentAndData: "adapt",
      delivery: "preserve",
    },
  });

  await writeJson("profile.json", {
    schemaVersion: "1.0",
    sourceSha256,
    slideSize: { width: 1280, height: 720 },
    styleBaseline: {
      colorTokens: ["emerald-400", "slate-950", "slate-50"],
      fontFamilies: [],
      headerFooter: { hasHeader: false, hasFooter: true, hasPageNumber: false },
    },
    pageBlueprints: [
      {
        blueprintId: "cover",
        sourceSlides: [1],
        roles: ["cover"],
        layoutStrategy: "reuse-or-extend",
        editableZones: ["title", "subtitle", "hero"],
        assetSlots: ["cover-hero-01"],
        textCapacity: { title: 24, body: 50 },
      },
    ],
    moduleBlueprints: [],
  });

  await writeJson("assets-manifest.json", {
    schemaVersion: "1.0",
    sourceSha256,
    assets: [
      {
        assetId: "cover-hero-01",
        role: "cover-hero",
        sourceSlide: 1,
        objectAnchor: "ellipse",
        sha256: null,
        defaultBoundary: "adapt",
        replacementOptions: {
          sources: ["package-assets", "user-supplied", "generated"],
          preserveFrame: true,
          preserveCropWhenPossible: true,
        },
      },
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
