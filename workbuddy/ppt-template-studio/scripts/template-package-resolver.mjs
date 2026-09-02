import { createHash } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.resolve(here, "../references/adapter-contract.json");
const boundaryKeys = [
  "visualBaseline",
  "pageFramework",
  "visualAssets",
  "contentAndData",
  "delivery",
];
const boundaryStates = new Set(["preserve", "adapt", "confirm"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toSafeString(value) {
  return hasText(value) ? value.trim() : null;
}

function isInside(root, candidate) {
  const normalizedRoot = path.resolve(root);
  const normalizedCandidate = path.resolve(candidate);
  const relative = path.relative(normalizedRoot, normalizedCandidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function resolveContainedRealPath(root, candidate, errorCode) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(resolvedRoot, candidate);
  if (!isInside(resolvedRoot, resolvedCandidate)) throw new Error(errorCode);

  const realCandidate = await realpath(resolvedCandidate);
  if (!isInside(resolvedRoot, realCandidate)) throw new Error(errorCode);
  return realCandidate;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

function versionFromReference(templateRef) {
  const reference = toSafeString(templateRef);
  if (!reference) return { match: null, version: null };

  const separator = reference.lastIndexOf("@");
  if (separator > 0 && separator < reference.length - 1) {
    return {
      match: reference.slice(0, separator),
      version: reference.slice(separator + 1),
    };
  }

  return { match: reference, version: null };
}

function packageMatches(pkg, match) {
  return pkg.displayName === match
    || pkg.packageId === match
    || Array.isArray(pkg.aliases) && pkg.aliases.includes(match);
}

function blocked(route, reason) {
  return { route, state: "blocked", reason };
}

function ensureBoundaryMap(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }

  const output = {};
  for (const key of boundaryKeys) {
    const state = value[key];
    if (!boundaryStates.has(state)) {
      throw new Error(`${label}.${key} must be preserve, adapt, or confirm.`);
    }
    output[key] = state;
  }

  for (const key of Object.keys(value)) {
    if (!boundaryKeys.includes(key)) {
      throw new Error(`${label}.${key} is not a supported boundary category.`);
    }
  }

  return output;
}

export function routePresentationRequest(input = {}) {
  const operation = toSafeString(input.operation);
  const templateSource = toSafeString(input.templateSource);
  const templatePackageName = toSafeString(input.templatePackageName);
  const templatePackageOwner = toSafeString(input.templatePackageOwner);
  const templateRef = toSafeString(input.templateRef);
  const contentBasis = toSafeString(input.contentBasis);

  if (operation === "build-template-package" || templateSource) {
    const missing = [
      ["templateSource", templateSource],
      ["templatePackageName", templatePackageName],
      ["templatePackageOwner", templatePackageOwner],
    ].filter(([, value]) => !value).map(([key]) => key);
    return {
      route: "build-template-package",
      state: missing.length === 0 ? "ready" : "needs-input",
      missing,
    };
  }

  if (templateRef) {
    return contentBasis
      ? { route: "template-fill", state: "ready", missing: [] }
      : { route: "template-fill", state: "needs-input", missing: ["contentBasis"] };
  }

  return contentBasis
    ? { route: "ppt-studio", state: "ready", missing: [] }
    : { route: "ppt-studio", state: "needs-input", missing: ["contentBasis"] };
}

export function evaluateRuntimeCapabilities(capabilities = []) {
  const provided = new Set(Array.isArray(capabilities) ? capabilities : []);
  const required = ["editable-pptx", "render-or-preview"];
  const missing = required.filter((capability) => !provided.has(capability));

  return missing.length === 0
    ? { state: "ready", missing: [] }
    : { state: "blocked", missing };
}

export function mergeBoundaries(defaultBoundaries, boundaryOverride = {}) {
  const defaults = ensureBoundaryMap(defaultBoundaries, "default boundaries");
  if (!boundaryOverride || typeof boundaryOverride !== "object" || Array.isArray(boundaryOverride)) {
    throw new Error("boundary override must be an object.");
  }

  const merged = { ...defaults };
  for (const [key, value] of Object.entries(boundaryOverride)) {
    if (!boundaryKeys.includes(key) || !boundaryStates.has(value)) {
      throw new Error(`boundary override ${key} is invalid.`);
    }
    merged[key] = value;
  }
  return merged;
}

async function loadContract() {
  return readJson(contractPath);
}

function resolvePageCount(packageManifest, input, effectiveBoundaries) {
  const fallback = packageManifest.framework?.defaultPageCount;
  const override = input.pageCountOverride;
  if (override === undefined || override === null) return fallback;

  if (!Number.isInteger(override) || override <= 0) {
    throw new Error("pageCountOverride must be a positive integer.");
  }
  if (effectiveBoundaries.pageFramework === "preserve") {
    throw new Error("pageCountOverride changes a preserved page framework.");
  }
  return override;
}

async function resolvePublishedPackage({ libraryRoot, templateRef }) {
  const { match, version: requestedVersion } = versionFromReference(templateRef);
  const realLibraryRoot = await realpath(libraryRoot);
  const indexPath = await resolveContainedRealPath(realLibraryRoot, "index.json", "path-outside-library");
  const index = await readJson(indexPath);
  const matches = (index.packages ?? []).filter((pkg) => packageMatches(pkg, match));

  if (matches.length === 0) throw new Error("package-not-found");
  if (matches.length > 1) throw new Error("package-ambiguous");

  const entry = matches[0];
  const selectedVersion = requestedVersion ?? entry.activeVersion;
  const versionEntry = (entry.versions ?? []).find((item) => item.version === selectedVersion);
  if (!versionEntry || versionEntry.status !== "verified") throw new Error("version-not-verified");
  if (!hasText(versionEntry.path) || path.isAbsolute(versionEntry.path)) throw new Error("path-outside-library");

  const packagePath = await resolveContainedRealPath(realLibraryRoot, versionEntry.path, "path-outside-library");
  const packageManifestPath = await resolveContainedRealPath(packagePath, "package.json", "manifest-not-verified");
  const profilePath = await resolveContainedRealPath(packagePath, "profile.json", "manifest-not-verified");
  const assetsManifestPath = await resolveContainedRealPath(packagePath, "assets-manifest.json", "manifest-not-verified");
  const packageManifest = await readJson(packageManifestPath);
  const profile = await readJson(profilePath);
  const assetsManifest = await readJson(assetsManifestPath);

  if (
    packageManifest.status !== "verified"
    || packageManifest.packageId !== entry.packageId
    || packageManifest.version !== selectedVersion
    || path.basename(packagePath) !== selectedVersion
  ) {
    throw new Error("manifest-not-verified");
  }

  const sourceName = packageManifest.source?.file;
  if (!hasText(sourceName) || path.isAbsolute(sourceName)) throw new Error("source-not-verified");
  const sourcePath = await resolveContainedRealPath(packagePath, sourceName, "source-not-verified");
  if (!(await stat(sourcePath)).isFile()) throw new Error("source-not-verified");

  const actualSha256 = await sha256(sourcePath);
  const expectedSha256 = packageManifest.source?.sha256;
  const hashes = [
    versionEntry.sourceSha256,
    expectedSha256,
    profile.sourceSha256,
    assetsManifest.sourceSha256,
  ];
  if (!hashes.every((hash) => hash === actualSha256)) {
    throw new Error("source-hash-mismatch");
  }

  return {
    libraryRoot: realLibraryRoot,
    indexPath,
    packagePath,
    packageManifest,
    sourceSha256: actualSha256,
    entry,
    version: selectedVersion,
  };
}

export async function resolveTemplateInvocation(input = {}) {
  const initialRoute = routePresentationRequest(input);

  const runtime = evaluateRuntimeCapabilities(input.runtimeCapabilities);
  if (runtime.state !== "ready") {
    return blocked(initialRoute.route, "runtime-capability-unavailable");
  }
  if (initialRoute.route !== "template-fill" || initialRoute.state !== "ready") return initialRoute;
  if (!hasText(input.libraryRoot)) {
    return { route: "template-fill", state: "needs-input", missing: ["libraryRoot"] };
  }

  try {
    const contract = await loadContract();
    const resolved = await resolvePublishedPackage(input);
    const effectiveBoundaries = mergeBoundaries(
      resolved.packageManifest.boundaries,
      input.boundaryOverride ?? {},
    );
    const pageCount = resolvePageCount(resolved.packageManifest, input, effectiveBoundaries);
    if (!Number.isInteger(pageCount) || pageCount <= 0) {
      return blocked("template-fill", "template-not-verified");
    }

    return {
      route: "template-fill",
      state: "ready",
      template: {
        libraryRoot: resolved.libraryRoot,
        indexPath: resolved.indexPath,
        packagePath: resolved.packagePath,
        packageId: resolved.entry.packageId,
        displayName: resolved.entry.displayName,
        version: resolved.version,
        sourceSha256: resolved.sourceSha256,
      },
      effective: {
        pageCount,
        boundaries: effectiveBoundaries,
        defaultOutline: resolved.packageManifest.framework?.defaultOutline ?? [],
        contractVersion: contract.schemaVersion,
      },
    };
  } catch (error) {
    if (error.message === "package-ambiguous") return blocked("template-fill", "template-ambiguous");
    if (error.message === "package-not-found") return blocked("template-fill", "template-not-found");
    return blocked("template-fill", "template-not-verified");
  }
}

function parseCliArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) continue;
    options[key.slice(2)] = value;
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseCliArgs(process.argv.slice(2));
  const runtimeCapabilities = hasText(args.capabilities)
    ? args.capabilities.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
  const result = await resolveTemplateInvocation({
    operation: args.operation,
    templateSource: args["template-source"],
    templatePackageName: args["template-package-name"],
    templatePackageOwner: args["template-package-owner"],
    libraryRoot: args["library-root"],
    templateRef: args["template-ref"],
    contentBasis: args.content,
    runtimeCapabilities,
    pageCountOverride: args["page-count"] ? Number(args["page-count"]) : undefined,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
