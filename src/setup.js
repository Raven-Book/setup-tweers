import { HttpClient } from "@actions/http-client";
import os from "os";

const REPO = "Raven-Book/TweeRS";
function getAssetName(platform, arch) {
  const p = platform || os.platform();
  const a = arch || os.arch();

  const map = {
    "linux-x64": "tweers-linux-x86_64.tar.gz",
    "linux-arm64": "tweers-linux-aarch64.tar.gz",
    "darwin-x64": "tweers-macos-x86_64.tar.gz",
    "darwin-arm64": "tweers-macos-arm64.tar.gz",
    "win32-x64": "tweers-windows-x86_64.zip",
  };

  const key = p + "-" + a;
  const asset = map[key];
  if (!asset) {
    throw new Error("Unsupported platform: " + key);
  }
  return asset;
}

async function getRelease(version, token) {
  const http = new HttpClient("setup-tweers", [], {
    headers: token ? { Authorization: "token " + token } : {},
  });

  let url;
  if (version === "latest") {
    url = "https://api.github.com/repos/" + REPO + "/releases/latest";
  } else {
    url = "https://api.github.com/repos/" + REPO + "/releases/tags/tweers-cli-v" + version;
  }

  const res = await http.getJson(url);
  if (res.statusCode !== 200) {
    throw new Error("Failed to fetch release: HTTP " + res.statusCode);
  }
  return res.result;
}

function parseVersion(tagName) {
  return tagName.replace("tweers-cli-v", "").replace(/^v/, "");
}

export { getAssetName, getRelease, parseVersion, REPO };
