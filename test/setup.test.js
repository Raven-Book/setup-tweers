import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { mkdtempSync, rmSync, chmodSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { getAssetName, getRelease, parseVersion } from "../src/setup.js";
describe("parseVersion", function() {
  it("should parse tweers-cli-v prefix", function() {
    expect(parseVersion("tweers-cli-v1.0.5")).toBe("1.0.5");
  });

  it("should parse v prefix", function() {
    expect(parseVersion("v2.0.0")).toBe("2.0.0");
  });

  it("should handle plain version", function() {
    expect(parseVersion("1.0.0")).toBe("1.0.0");
  });
});

describe("getAssetName", function() {
  it("should return linux x64 asset", function() {
    expect(getAssetName("linux", "x64")).toBe("tweers-linux-x86_64.tar.gz");
  });

  it("should return linux arm64 asset", function() {
    expect(getAssetName("linux", "arm64")).toBe("tweers-linux-aarch64.tar.gz");
  });

  it("should return macos x64 asset", function() {
    expect(getAssetName("darwin", "x64")).toBe("tweers-macos-x86_64.tar.gz");
  });

  it("should return macos arm64 asset", function() {
    expect(getAssetName("darwin", "arm64")).toBe("tweers-macos-arm64.tar.gz");
  });

  it("should return windows x64 asset", function() {
    expect(getAssetName("win32", "x64")).toBe("tweers-windows-x86_64.zip");
  });

  it("should throw on unsupported platform", function() {
    expect(function() { getAssetName("freebsd", "x64"); }).toThrow("Unsupported platform");
  });
});

describe("getRelease", function() {
  it("should fetch latest release", async function() {
    const release = await getRelease("latest");
    expect(release.tag_name).toMatch(/^tweers-cli-v/);
    expect(release.assets.length).toBeGreaterThan(0);
  });

  it("should fetch specific version", async function() {
    const release = await getRelease("1.0.5");
    expect(release.tag_name).toBe("tweers-cli-v1.0.5");
    expect(parseVersion(release.tag_name)).toBe("1.0.5");
  });

  it("should contain expected platform assets", async function() {
    const release = await getRelease("latest");
    const names = release.assets.map(function(a) { return a.name; });
    expect(names).toContain("tweers-linux-x86_64.tar.gz");
    expect(names).toContain("tweers-macos-arm64.tar.gz");
    expect(names).toContain("tweers-windows-x86_64.zip");
  });

  it("should throw on non-existent version", async function() {
    await expect(getRelease("99.99.99")).rejects.toThrow("Failed to fetch release");
  });
});

describe("download and verify binary", function() {
  let tmpDir;

  it("should download, extract, and run tweers --version", async function() {
    const release = await getRelease("latest");
    const expectedVersion = parseVersion(release.tag_name);
    const assetName = getAssetName();

    const asset = release.assets.find(function(a) { return a.name === assetName; });
    expect(asset).toBeDefined();

    // Download to temp dir
    tmpDir = mkdtempSync(join(tmpdir(), "tweers-test-"));
    const archivePath = join(tmpDir, assetName);

    execSync("curl -sL -A setup-tweers -o " + archivePath + " " + asset.browser_download_url);

    // Extract
    if (assetName.endsWith(".tar.gz")) {
      execSync("tar -xzf " + archivePath + " -C " + tmpDir);
    }

    // Find and verify binary
    const bin = join(tmpDir, "tweers");
    chmodSync(bin, 0o755);

    const output = execSync(bin + " --version").toString().trim();
    expect(output).toContain(expectedVersion);

    // Cleanup
    rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = null;
  }, 60000);
});
