import core from "@actions/core";
import tc from "@actions/tool-cache";
import { getAssetName, getRelease, parseVersion } from "./setup.js";

const TOOL_NAME = "tweers";
async function run() {
  try {
    const version = core.getInput("version") || "latest";
    const token = core.getInput("token");

    core.info("Fetching TweeRS release: " + version);
    const release = await getRelease(version, token);

    const tagVersion = parseVersion(release.tag_name);
    core.info("Resolved version: " + tagVersion);

    // Check tool cache first
    let toolDir = tc.find(TOOL_NAME, tagVersion);
    if (toolDir) {
      core.info("Found in tool cache");
      core.addPath(toolDir);
      core.setOutput("version", tagVersion);
      return;
    }

    // Find matching asset
    const assetName = getAssetName();
    const asset = release.assets.find(function(a) {
      return a.name === assetName;
    });
    if (!asset) {
      throw new Error("Asset not found: " + assetName);
    }

    core.info("Downloading " + asset.name);
    const downloadPath = await tc.downloadTool(asset.browser_download_url);

    let extractedDir;
    if (assetName.endsWith(".zip")) {
      extractedDir = await tc.extractZip(downloadPath);
    } else {
      extractedDir = await tc.extractTar(downloadPath);
    }

    // Cache the tool
    toolDir = await tc.cacheDir(extractedDir, TOOL_NAME, tagVersion);
    core.addPath(toolDir);
    core.setOutput("version", tagVersion);
    core.info("TweeRS " + tagVersion + " installed successfully");

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
