import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  evaluateRuntimeCapabilities,
  mergeBoundaries,
  resolveTemplateInvocation,
  routePresentationRequest,
} from "../ppt-template-studio/scripts/template-package-resolver.mjs";

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../ppt-template-studio");
const fixtureLibrary = path.join(here, "fixtures", "template-library");
const requiredCapabilities = ["editable-pptx", "render-or-preview"];

async function withFixtureCopy(run) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "workbuddy-ppt-template-"));
  const libraryRoot = path.join(tempRoot, "ppt-template-library");
  await cp(fixtureLibrary, libraryRoot, { recursive: true });

  try {
    return await run(libraryRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function updateJson(filePath, mutate) {
  const source = JSON.parse(await readFile(filePath, "utf8"));
  mutate(source);
  await writeFile(filePath, `${JSON.stringify(source, null, 2)}\n`, "utf8");
}

test("routes a named package with missing content to template-fill instead of a generic deck", () => {
  const route = routePresentationRequest({ templateRef: "市场调研·活力手账" });

  assert.deepEqual(route, {
    route: "template-fill",
    state: "needs-input",
    missing: ["contentBasis"],
  });
});

test("gives explicit template-building intent priority over a named template fill", () => {
  const route = routePresentationRequest({
    operation: "build-template-package",
    templateRef: "市场调研·活力手账",
    templateSource: "D:\\demo\\reference.pptx",
    templatePackageName: "销售复盘·清爽蓝",
    templatePackageOwner: "销售运营",
  });

  assert.deepEqual(route, {
    route: "build-template-package",
    state: "ready",
    missing: [],
  });
});

test("returns a ready build route after its minimal inputs and capabilities are present", async () => {
  const result = await resolveTemplateInvocation({
    operation: "build-template-package",
    templateSource: "D:\\demo\\reference.pptx",
    templatePackageName: "销售复盘·清爽蓝",
    templatePackageOwner: "销售运营",
    runtimeCapabilities: requiredCapabilities,
  });

  assert.deepEqual(result, {
    route: "build-template-package",
    state: "ready",
    missing: [],
  });
});

test("resolves display name, alias, and id@version to the verified active package", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    for (const templateRef of ["市场调研·活力手账", "活力手账", "market-research-playful@v1"]) {
      const result = await resolveTemplateInvocation({
        libraryRoot,
        templateRef,
        contentBasis: "XR 直播间市场调研，面向内部领导。",
        runtimeCapabilities: requiredCapabilities,
      });

      assert.equal(result.state, "ready");
      assert.equal(result.route, "template-fill");
      assert.equal(result.template.packageId, "market-research-playful");
      assert.equal(result.template.version, "v1");
      assert.equal(result.effective.pageCount, 12);
      assert.deepEqual(result.effective.boundaries, {
        visualBaseline: "preserve",
        pageFramework: "adapt",
        visualAssets: "adapt",
        contentAndData: "adapt",
        delivery: "preserve",
      });
    }
  });
});

test("derives the default template library from the supplied workspace root", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const result = await resolveTemplateInvocation({
      workspaceRoot: path.dirname(libraryRoot),
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(result.state, "ready");
    assert.equal(result.route, "template-fill");
    assert.equal(result.template.packageId, "market-research-playful");
  });
});

test("asks for one confirm boundary decision before it returns a ready template fill", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const packageManifestPath = path.join(libraryRoot, "market-research-playful", "v1", "package.json");
    await updateJson(packageManifestPath, (packageManifest) => {
      packageManifest.boundaries.visualAssets = "confirm";
    });

    const awaitingDecision = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.deepEqual(awaitingDecision, {
      route: "template-fill",
      state: "needs-input",
      missing: ["boundaryOverride.visualAssets"],
      confirmation: {
        category: "visualAssets",
        allowedStates: ["preserve", "adapt"],
      },
    });

    const resolved = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      boundaryOverride: { visualAssets: "adapt" },
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(resolved.state, "ready");
    assert.equal(resolved.effective.boundaries.visualAssets, "adapt");
  });
});

test("preserves unspecified boundaries while allowing one explicit category override", () => {
  const effective = mergeBoundaries(
    {
      visualBaseline: "preserve",
      pageFramework: "adapt",
      visualAssets: "adapt",
      contentAndData: "adapt",
      delivery: "preserve",
    },
    { visualAssets: "preserve" },
  );

  assert.deepEqual(effective, {
    visualBaseline: "preserve",
    pageFramework: "adapt",
    visualAssets: "preserve",
    contentAndData: "adapt",
    delivery: "preserve",
  });
  assert.throws(() => mergeBoundaries(effective, { pageFramework: "strict" }), /boundary/i);
});

test("blocks a named package when template verification fails rather than falling back to a generic deck", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const indexPath = path.join(libraryRoot, "index.json");
    await updateJson(indexPath, (index) => {
      index.packages[0].versions[0].sourceSha256 = "0".repeat(64);
    });

    const result = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(result.route, "template-fill");
    assert.equal(result.state, "blocked");
    assert.equal(result.reason, "template-not-verified");
  });
});

test("blocks a template whose registered path escapes the selected library", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const indexPath = path.join(libraryRoot, "index.json");
    await updateJson(indexPath, (index) => {
      index.packages[0].versions[0].path = "../outside";
    });

    const result = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(result.route, "template-fill");
    assert.equal(result.state, "blocked");
    assert.equal(result.reason, "template-not-verified");
  });
});

test("blocks a package directory link that resolves outside the selected library", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const versionPath = path.join(libraryRoot, "market-research-playful", "v1");
    const outsideVersionPath = path.join(path.dirname(libraryRoot), "outside-version");
    await cp(versionPath, outsideVersionPath, { recursive: true });
    await rm(versionPath, { recursive: true, force: true });
    await symlink(
      outsideVersionPath,
      versionPath,
      process.platform === "win32" ? "junction" : "dir",
    );

    const result = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(result.route, "template-fill");
    assert.equal(result.state, "blocked");
    assert.equal(result.reason, "template-not-verified");
  });
});

test("blocks a source directory link that resolves outside the selected package", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const versionPath = path.join(libraryRoot, "market-research-playful", "v1");
    const outsideSourcePath = path.join(path.dirname(libraryRoot), "outside-source");
    await cp(versionPath, outsideSourcePath, { recursive: true });
    const packageManifestPath = path.join(versionPath, "package.json");
    await updateJson(packageManifestPath, (packageManifest) => {
      packageManifest.source.file = "source-link/original-template.pptx";
    });
    const sourceLinkPath = path.join(versionPath, "source-link");
    await symlink(
      outsideSourcePath,
      sourceLinkPath,
      process.platform === "win32" ? "junction" : "dir",
    );

    const result = await resolveTemplateInvocation({
      libraryRoot,
      templateRef: "市场调研·活力手账",
      contentBasis: "XR 直播间市场调研，面向内部领导。",
      runtimeCapabilities: requiredCapabilities,
    });

    assert.equal(result.route, "template-fill");
    assert.equal(result.state, "blocked");
    assert.equal(result.reason, "template-not-verified");
  });
});

test("requires editable export and render-or-preview before it treats a deck as ready", () => {
  const result = evaluateRuntimeCapabilities(["editable-pptx"]);

  assert.deepEqual(result, {
    state: "blocked",
    missing: ["render-or-preview"],
  });
});

test("blocks every selected route when either required runtime capability is missing", async () => {
  const build = await resolveTemplateInvocation({
    operation: "build-template-package",
    templateSource: "D:\\demo\\reference.pptx",
    templatePackageName: "销售复盘·清爽蓝",
    templatePackageOwner: "销售运营",
    runtimeCapabilities: ["editable-pptx"],
  });
  const newDeck = await resolveTemplateInvocation({
    contentBasis: "中国大陆 XR 直播间市场调研，12 页。",
    runtimeCapabilities: ["editable-pptx"],
  });

  assert.deepEqual(build, {
    route: "build-template-package",
    state: "blocked",
    reason: "runtime-capability-unavailable",
  });
  assert.deepEqual(newDeck, {
    route: "ppt-studio",
    state: "blocked",
    reason: "runtime-capability-unavailable",
  });
});

test("CLI forwards build-template-package fields to the resolver", async () => {
  const resolverPath = path.join(packageRoot, "scripts", "template-package-resolver.mjs");
  const { stdout } = await execFileAsync(process.execPath, [
    resolverPath,
    "--operation",
    "build-template-package",
    "--template-source",
    "D:\\demo\\reference.pptx",
    "--template-package-name",
    "销售复盘·清爽蓝",
    "--template-package-owner",
    "销售运营",
    "--capabilities",
    "editable-pptx,render-or-preview",
  ]);

  assert.deepEqual(JSON.parse(stdout), {
    route: "build-template-package",
    state: "ready",
    missing: [],
  });
});

test("CLI forwards a boundary decision for a named template fill", async () => {
  await withFixtureCopy(async (libraryRoot) => {
    const packageManifestPath = path.join(libraryRoot, "market-research-playful", "v1", "package.json");
    await updateJson(packageManifestPath, (packageManifest) => {
      packageManifest.boundaries.visualAssets = "confirm";
    });

    const resolverPath = path.join(packageRoot, "scripts", "template-package-resolver.mjs");
    const { stdout } = await execFileAsync(process.execPath, [
      resolverPath,
      "--library-root",
      libraryRoot,
      "--template-ref",
      "市场调研·活力手账",
      "--content",
      "XR 直播间市场调研，面向内部领导。",
      "--boundary-override",
      JSON.stringify({ visualAssets: "adapt" }),
      "--capabilities",
      "editable-pptx,render-or-preview",
    ]);

    const result = JSON.parse(stdout);
    assert.equal(result.state, "ready");
    assert.equal(result.effective.boundaries.visualAssets, "adapt");
  });
});

test("ships an upload archive that exactly matches its source directory", async () => {
  const archiveHelper = path.join(here, "assert-upload-archive.ps1");
  const archivePath = path.resolve(here, "../ppt-template-studio.zip");
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    archiveHelper,
    "-ArchivePath",
    archivePath,
    "-SourceDirectory",
    packageRoot,
  ]);
  const result = JSON.parse(stdout);
  assert.equal(result.result, "match");
  assert.ok(result.files >= 1);
});

test("ships a valid Office Open XML fixture and a self-contained adapter contract", async () => {
  const fixturePptx = path.join(
    fixtureLibrary,
    "market-research-playful",
    "v1",
    "original-template.pptx",
  );
  const helper = path.join(here, "assert-pptx-fixture.ps1");
  const contractPath = path.join(packageRoot, "references", "adapter-contract.json");
  const skillPath = path.join(packageRoot, "SKILL.md");
  const readmePath = path.join(packageRoot, "README.md");

  await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    helper,
    "-PptxPath",
    fixturePptx,
  ]);

  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const skill = await readFile(skillPath, "utf8");
  const readme = await readFile(readmePath, "utf8");

  assert.equal(contract.templateLibrary.defaultRelativeRoot, "ppt-template-library");
  assert.deepEqual(contract.routePriority, [
    "build-template-package",
    "template-fill",
    "ppt-studio",
  ]);
  assert.deepEqual(contract.requiredRuntimeCapabilities, requiredCapabilities);
  assert.deepEqual(contract.buildTemplatePackage.minimumInput, [
    "templateSource",
    "templatePackageName",
    "templatePackageOwner",
  ]);
  assert.deepEqual(contract.requiredRuntimeCapabilitiesApplyTo, [
    "build-template-package",
    "template-fill",
    "ppt-studio",
  ]);
  assert.match(skill, /^---\r?\nname: ppt-template-studio\r?\n/m);
  assert.match(skill, /\[适配契约\]\(references\/adapter-contract\.json\)/);
  assert.match(skill, /workspaceRoot/);
  assert.match(readme, /WorkBuddy/);
  assert.match(readme, /--workspace-root/);
});
